import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Cart.css';

export default function Cart() {
  const { cart, removeItem, addItem, clearCart, cartTotal } = useCart();
  const { isAuthenticated, isBuyer, user } = useAuth();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const delivery = cartTotal > 500 ? 0 : 49;
  const total = cartTotal - discount + delivery;

  // Checkout modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FRESH10') {
      setDiscount(Math.floor(cartTotal * 0.1));
      setCouponMsg('Coupon FRESH10 applied: 10% discount');
    } else if (coupon.toUpperCase() === 'AGRI20') {
      setDiscount(Math.floor(cartTotal * 0.2));
      setCouponMsg('Coupon AGRI20 applied: 20% discount');
    } else {
      setCouponMsg('Invalid coupon code. Try FRESH10 or AGRI20.');
    }
    setTimeout(() => setCouponMsg(''), 4000);
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const itemId        = (item) => item.cartItemId  ?? item.id;
  const itemName      = (item) => item.productName ?? item.name;
  const PLACEHOLDER   = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80';
  const itemImg       = (item) => item.productImage ?? item.image ?? item.img ?? PLACEHOLDER;
  const itemPrice     = (item) => Number(item.price ?? 0);
  const itemQty       = (item) => item.quantity ?? item.qty ?? 1;
  const itemUnit      = (item) => item.unit ?? '';
  const itemFarmer    = (item) => item.farmerName ?? item.farmer ?? '';
  const itemLocation  = (item) => item.farmerLocation ?? item.location ?? '';
  const itemOrganic   = (item) => item.organicCertified ?? item.organic ?? false;
  const itemProductId = (item) => item.productId ?? item.id;

  const handleDecrement = (item) => {
    removeItem(itemId(item));
  };

  const handleIncrement = (item) => {
    addItem(itemProductId(item), 1);
  };

  // ─── Payment Flow ────────────────────────────────────────────────────────────
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!isBuyer()) {
      setCheckoutError('Only buyers can place orders. Please log in with a buyer account.');
      return;
    }
    setCheckoutError('');
    setDeliveryAddress('');
    setShowAddressModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      setCheckoutError('Please enter a delivery address.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      // Step 1: Create order on backend (uses cart items automatically)
      const orderRes = await api.post('/buyer/orders', {
        deliveryAddress: deliveryAddress.trim(),
      });
      const order = orderRes.data?.data;
      if (!order?.id) throw new Error('Failed to create order.');

      // Step 2: Create Razorpay payment order
      const paymentRes = await api.post(`/buyer/payments/create-order/${order.id}`);
      const paymentData = paymentRes.data?.data;
      if (!paymentData?.razorpayOrderId) throw new Error('Failed to create payment order.');

      setShowAddressModal(false);
      setCheckoutLoading(false);

      // Step 3: Open Razorpay checkout widget
      const options = {
        key: paymentData.keyId,
        amount: Math.round(Number(paymentData.amount) * 100), // paise
        currency: paymentData.currency || 'INR',
        name: paymentData.companyName || 'Smart Agriculture Marketplace',
        description: paymentData.description || `Order #ORD-${order.id}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        theme: { color: '#2E7D32' },
        handler: async (response) => {
          // Step 4: Verify payment signature on backend
          try {
            await api.post('/buyer/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            setOrderSuccess('Payment successful. Your order has been confirmed. Check your email for details.');
            setTimeout(() => { setOrderSuccess(''); navigate('/'); }, 4000);
          } catch (err) {
            setCheckoutError('Payment was received but verification failed. Please contact support with Order ID: ' + order.id);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await api.post(`/buyer/payments/failure?razorpayOrderId=${paymentData.razorpayOrderId}`);
            } catch (_) {}
          },
        },
      };

      if (!window.Razorpay) {
        setCheckoutError('Razorpay failed to load. Please check your internet connection and try again.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        try {
          await api.post(`/buyer/payments/failure?razorpayOrderId=${paymentData.razorpayOrderId}`);
        } catch (_) {}
        setCheckoutError('Payment failed: ' + (response.error?.description || 'Unknown error. Please try again.'));
      });
      rzp.open();

    } catch (err) {
      setCheckoutLoading(false);
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please try again.';
      setCheckoutError(msg);
    }
  };

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (cart.length === 0) return (
    <div className="cart-empty-page">
      <div className="container cart-empty">
        <div className="empty-icon" style={{ fontSize: '3rem', color: '#ccc' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h2>Your cart is empty</h2>
        <p>Explore our fresh farm products and add items to your cart.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Cart</span>
          </nav>
        </div>
      </div>

      {/* Success/Error Messages */}
      {orderSuccess && (
        <div className="container" style={{ marginTop: 16 }}>
          <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', color: '#2E7D32', padding: '12px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem' }}>
            {orderSuccess}
          </div>
        </div>
      )}
      {checkoutError && !showAddressModal && (
        <div className="container" style={{ marginTop: 16 }}>
          <div style={{ background: '#FFEBEE', border: '1.5px solid #E53935', color: '#C62828', padding: '12px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem' }}>
            {checkoutError}
          </div>
        </div>
      )}

      <div className="container cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="cart-items-header">
            <h2>Shopping Cart <span>({cart.length} items)</span></h2>
            <button className="clear-btn" onClick={clearCart}>Clear All</button>
          </div>

          {cart.map((item, index) => (
            <div className="cart-item" key={itemId(item) ?? index}>
              <img src={itemImg(item)} alt={itemName(item)} className="cart-item-img" />
              <div className="cart-item-info">
                <div className="cart-item-name">{itemName(item)}</div>
                <div className="cart-item-farmer">
                  {itemFarmer(item)}{itemLocation(item) ? ` \u2022 ${itemLocation(item)}` : ''}
                </div>
                {itemOrganic(item) && (
                  <span className="badge-organic" style={{ fontSize: '0.68rem' }}>Organic</span>
                )}
                <div className="cart-item-price">Rs.{itemPrice(item)} / {itemUnit(item)}</div>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button onClick={() => handleDecrement(item)}>&minus;</button>
                  <span>{itemQty(item)}</span>
                  <button onClick={() => handleIncrement(item)}>+</button>
                </div>
                <div className="cart-item-total">
                  Rs.{(itemPrice(item) * itemQty(item)).toFixed(2)}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(itemId(item))}
                >&times;</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal</span><span>Rs.{Number(cartTotal).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-line discount">
                <span>Discount</span><span>&minus;Rs.{discount}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Delivery {cartTotal > 500 ? '(Free)' : ''}</span>
              <span>{delivery === 0 ? 'FREE' : `Rs.${delivery}`}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span><span>Rs.{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code (FRESH10)"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              className="coupon-input"
            />
            <button className="coupon-btn" onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && (
            <div style={{ fontSize: '0.8rem', color: couponMsg.includes('Invalid') ? '#C62828' : '#2E7D32', marginTop: 4, fontWeight: 600 }}>
              {couponMsg}
            </div>
          )}

          <button
            className="checkout-btn"
            onClick={handleCheckoutClick}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
          <Link to="/shop" className="continue-shopping">&larr; Continue Shopping</Link>

          <div className="secure-badges">
            <span>Secure Payment</span>
            <span>Easy Returns</span>
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>

      {/* ─── Delivery Address Modal ─────────────────────────────────────────── */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => !checkoutLoading && setShowAddressModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delivery Details</h3>
              <button
                className="modal-close"
                onClick={() => !checkoutLoading && setShowAddressModal(false)}
              >&times;</button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">Where should we deliver your order?</p>

              <div className="modal-summary">
                <div className="modal-summary-row">
                  <span>Items ({cart.length})</span>
                  <span>Rs.{Number(cartTotal).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="modal-summary-row green">
                    <span>Discount</span>
                    <span>&minus;Rs.{discount}</span>
                  </div>
                )}
                <div className="modal-summary-row">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? 'FREE' : `Rs.${delivery}`}</span>
                </div>
                <div className="modal-summary-row total-row">
                  <span>Total Payable</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              <label className="addr-label">Delivery Address *</label>
              <textarea
                className="addr-input"
                rows={4}
                placeholder="House/Flat No., Street, Area, City, State - PIN Code"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                disabled={checkoutLoading}
              />

              {checkoutError && (
                <div className="checkout-error">{checkoutError}</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowAddressModal(false)}
                disabled={checkoutLoading}
              >
                Cancel
              </button>
              <button
                className="modal-pay-btn"
                onClick={handlePlaceOrder}
                disabled={checkoutLoading || !deliveryAddress.trim()}
              >
                {checkoutLoading
                  ? <span className="btn-spinner">Creating Order...</span>
                  : `Pay Rs.${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
