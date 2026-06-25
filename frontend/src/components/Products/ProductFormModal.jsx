import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data';
import './ProductFormModal.css';

const EMPTY_FORM = {
  name: '',
  price: '',
  unit: 'kg',
  category: '',
  farmer: '',
  location: '',
  organic: false,
  stock: true,
  stockQty: 10,
  discount: 0,
  img: '',
  imageFile: null,   // File object from device upload
  description: '',
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
  'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&q=80',
  'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&q=80',
  'https://images.unsplash.com/photo-1592321675774-3de57f3ee0dc?w=400&q=80',
];

export default function ProductFormModal({ editProduct = null, onClose, onSuccess }) {
  const { addProduct, updateProduct } = useProducts();
  const { user } = useAuth();
  const isEdit = !!editProduct;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1=Basic, 2=Media, 3=Pricing
  const [imgTab, setImgTab] = useState('upload'); // 'upload' | 'url' | 'gallery'
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || editProduct.productName || '',
        price: String(editProduct.price || ''),
        unit: editProduct.unit || 'kg',
        category: editProduct.category || editProduct.categoryName || '',
        farmer: editProduct.farmer || editProduct.farmerName || '',
        location: editProduct.location || editProduct.farmerLocation || '',
        organic: editProduct.organic || editProduct.organicCertified || false,
        stock: editProduct.stock !== false && editProduct.stock !== 0,
        stockQty: typeof editProduct.stock === 'number' ? editProduct.stock : 10,
        discount: editProduct.discount || 0,
        img: editProduct.image || editProduct.img || editProduct.imageUrl || '',
        imageFile: null,
        description: editProduct.description || '',
      });
      // FIX: set the correct preview URL pointing to the backend uploads folder
      const existingImg = editProduct.image || editProduct.img || editProduct.imageUrl || null;
      if (existingImg) {
        // If it's already a full URL (http/https), use as-is; otherwise prefix with backend base
        const previewUrl = existingImg.startsWith('http')
          ? existingImg
          : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${existingImg}`;
        setPreview(previewUrl);
      }
      setImgTab('url');
    } else {
      // Pre-fill farmer info for farmer users
      if (user?.role === 'farmer') {
        setForm(f => ({
          ...f,
          farmer: user.name || '',
          location: user.location || '',
        }));
      }
    }
  }, [editProduct, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
    if (name === 'img') setPreview(value);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.farmer.trim()) errs.farmer = 'Farmer name is required';
    // Accept either an uploaded file OR a URL
    if (!(form.imageFile instanceof File) && !form.img.trim()) errs.img = 'Product image is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Jump to first step with error
      if (errs.name || errs.category || errs.farmer) setStep(1);
      else if (errs.img) setStep(2);
      else if (errs.price) setStep(3);
      return;
    }
    setSubmitting(true);

    // Resolve category name → numeric ID (backend needs categoryId: Long)
    const matchedCategory = categories.find(c => c.name === form.category);
    const categoryId = matchedCategory?.id ?? null;

    // FIX: Always pass `image` as the File when available.
    // When using a URL (gallery or URL tab), pass it as `imageUrl` inside the
    // product JSON so buildMultipartPayload can include it in the JSON part.
    const productData = {
      name:        form.name,
      productName: form.name,          // backend may expect either key
      description: form.description,
      price:       parseFloat(form.price),
      stock:       form.stock,
      stockQty:    parseInt(form.stockQty) || (form.stock ? 1 : 0),
      unit:        form.unit,
      categoryId:  categoryId,
      organic:     form.organic,
      organicCertified: form.organic,
      discount:    parseInt(form.discount) || 0,
      // Pass the File directly — buildMultipartPayload checks `instanceof File`
      image:       form.imageFile instanceof File ? form.imageFile : undefined,
      // FIX: also pass imageUrl so the JSON part carries it when no file is uploaded
      imageUrl:    form.imageFile instanceof File ? undefined : form.img,
    };

    if (isEdit) {
      await updateProduct(editProduct.id, productData);
    } else {
      await addProduct(productData);
    }

    setSuccess(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess?.();
      onClose?.();
    }, 1200);
  };

  const stepLabels = ['Basic Info', 'Photo', 'Pricing & Stock'];

  return (
    <div className="pfm-overlay" onClick={onClose}>
      <div className="pfm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pfm-header">
          <div className="pfm-header-left">
            <div className="pfm-title-icon">{isEdit ? '' : ''}</div>
            <div>
              <h2 className="pfm-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="pfm-sub">Fill in the details to {isEdit ? 'update' : 'list'} your product</p>
            </div>
          </div>
          <button className="pfm-close" onClick={onClose}></button>
        </div>

        {/* Step Progress */}
        <div className="pfm-steps">
          {stepLabels.map((label, i) => (
            <React.Fragment key={label}>
              <button
                className={`pfm-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
                onClick={() => setStep(i + 1)}
              >
                <div className="pfm-step-circle">
                  {step > i + 1 ? '' : i + 1}
                </div>
                <span>{label}</span>
              </button>
              {i < stepLabels.length - 1 && (
                <div className={`pfm-step-line ${step > i + 1 ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="pfm-body">

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <div className="pfm-step-content">
              <div className="pfm-form-grid">

                <div className="pfm-field full">
                  <label className="pfm-label">Product Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`pfm-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Fresh Organic Tomatoes"
                  />
                  {errors.name && <span className="pfm-error">{errors.name}</span>}
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`pfm-input ${errors.category ? 'error' : ''}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                  {errors.category && <span className="pfm-error">{errors.category}</span>}
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="pfm-input">
                    {['kg', 'gram', 'piece', 'dozen', 'bundle', 'litre', 'quintal'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Farmer / Seller Name *</label>
                  <input
                    name="farmer"
                    value={form.farmer}
                    onChange={handleChange}
                    className={`pfm-input ${errors.farmer ? 'error' : ''}`}
                    placeholder="Your full name"
                    readOnly={user?.role === 'farmer'}
                  />
                  {errors.farmer && <span className="pfm-error">{errors.farmer}</span>}
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="pfm-input"
                    placeholder="City, State"
                  />
                </div>

                <div className="pfm-field full">
                  <label className="pfm-label">Product Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="pfm-input pfm-textarea"
                    placeholder="Describe your product — freshness, quality, growing method..."
                    rows={3}
                  />
                </div>

                <div className="pfm-field full">
                  <div className="pfm-toggles">
                    <label className="pfm-toggle">
                      <input type="checkbox" name="organic" checked={form.organic} onChange={handleChange} />
                      <span className="toggle-track">
                        <span className="toggle-thumb" />
                      </span>
                      <span> Organic Product</span>
                    </label>
                    <label className="pfm-toggle">
                      <input type="checkbox" name="stock" checked={form.stock} onChange={handleChange} />
                      <span className="toggle-track">
                        <span className="toggle-thumb" />
                      </span>
                      <span> In Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Photo ── */}
          {step === 2 && (
            <div className="pfm-step-content">
              {/* ─── Tab bar ─── */}
              <div className="pfm-img-tabs">
                <button
                  type="button"
                  className={`pfm-img-tab ${imgTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setImgTab('upload')}
                > Upload from Device</button>
                <button
                  type="button"
                  className={`pfm-img-tab ${imgTab === 'url' ? 'active' : ''}`}
                  onClick={() => setImgTab('url')}
                > Image URL</button>
                <button
                  type="button"
                  className={`pfm-img-tab ${imgTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => setImgTab('gallery')}
                > Sample Gallery</button>
              </div>

              {/* ─── Upload from device ─── */}
              {imgTab === 'upload' && (
                <div className="pfm-field full" style={{ marginTop: 16 }}>
                  <input
                    id="pfm-file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // FIX: clear img URL when a file is picked so they don't conflict
                      setForm(f => ({ ...f, imageFile: file, img: '' }));
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setPreview(ev.target.result);
                        if (errors.img) setErrors(er => ({ ...er, img: '' }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <div
                    className={`pfm-dropzone ${dragOver ? 'drag-over' : ''} ${form.imageFile ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('pfm-file-input').click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (!file || !file.type.startsWith('image/')) return;
                      // FIX: clear img URL when a file is dropped
                      setForm(f => ({ ...f, imageFile: file, img: '' }));
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setPreview(ev.target.result);
                        if (errors.img) setErrors(er => ({ ...er, img: '' }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  >
                    {form.imageFile ? (
                      <>
                        <div className="pfm-dropzone-file-icon"></div>
                        <div className="pfm-dropzone-filename">{form.imageFile.name}</div>
                        <div className="pfm-dropzone-hint">Click to change image</div>
                      </>
                    ) : (
                      <>
                        <div className="pfm-dropzone-icon"></div>
                        <div className="pfm-dropzone-text">Click to browse or drag &amp; drop</div>
                        <div className="pfm-dropzone-hint">Supports JPG, PNG, WEBP · Max 10MB</div>
                      </>
                    )}
                  </div>
                  {errors.img && <span className="pfm-error">{errors.img}</span>}
                </div>
              )}

              {imgTab === 'url' && (
                <div className="pfm-field full" style={{ marginTop: 16 }}>
                  <label className="pfm-label">Image URL *</label>
                  <input
                    name="img"
                    value={form.img}
                    onChange={(e) => {
                      handleChange(e);
                      // FIX: clear imageFile when user types a URL so they don't conflict
                      setForm(f => ({ ...f, imageFile: null, img: e.target.value }));
                      setPreview(e.target.value);
                      if (errors.img) setErrors(er => ({ ...er, img: '' }));
                    }}
                    className={`pfm-input ${errors.img ? 'error' : ''}`}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {errors.img && <span className="pfm-error">{errors.img}</span>}
                  <p className="pfm-hint">Paste any image URL. We recommend Unsplash for high quality images.</p>
                </div>
              )}

              {imgTab === 'gallery' && (
                <div className="pfm-gallery">
                  {SAMPLE_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      className={`pfm-gallery-item ${form.img === img ? 'selected' : ''}`}
                      onClick={() => {
                        // FIX: clear imageFile when selecting from gallery
                        setForm(f => ({ ...f, img, imageFile: null }));
                        setPreview(img);
                        if (errors.img) setErrors(e => ({ ...e, img: '' }));
                      }}
                    >
                      <img src={img} alt={`Sample ${i + 1}`} />
                      {form.img === img && <div className="pfm-gallery-check"></div>}
                    </div>
                  ))}
                  {errors.img && <span className="pfm-error">{errors.img}</span>}
                </div>
              )}

              {/* Live Preview Card */}
              {/* FIX: preview state now always holds the correct image (blob URL or http URL) */}
              {preview && (
                <div className="pfm-preview-section">
                  <p className="pfm-label">Live Card Preview</p>
                  <div className="pfm-card-preview">
                    <div className="pfm-preview-img-wrap">
                      <img src={preview} alt="Preview" className="pfm-preview-img" />
                      {form.organic && <span className="pfm-preview-badge"> Organic</span>}
                      {form.discount > 0 && <span className="pfm-preview-discount">-{form.discount}%</span>}
                    </div>
                    <div className="pfm-preview-body">
                      <div className="pfm-preview-name">{form.name || 'Product Name'}</div>
                      <div className="pfm-preview-farmer">
                        <span></span>
                        <div>
                          <div>{form.farmer || 'Farmer Name'}</div>
                          <div className="pfm-preview-loc"> {form.location || 'Location'}</div>
                        </div>
                      </div>
                      <div className="pfm-preview-footer">
                        <div>
                          <div className="pfm-preview-price">
                            ₹{form.price || '0'}<span> / {form.unit}</span>
                          </div>
                          <div className={`pfm-preview-stock ${form.stock ? 'in' : 'out'}`}>
                            {form.stock ? ' In Stock' : ' Out of Stock'}
                          </div>
                        </div>
                        <button className="pfm-preview-cart"></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Pricing & Stock ── */}
          {step === 3 && (
            <div className="pfm-step-content">
              <div className="pfm-form-grid">

                <div className="pfm-field">
                  <label className="pfm-label">Selling Price (₹) *</label>
                  <div className="pfm-price-input-wrap">
                    <span className="pfm-rupee">₹</span>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      className={`pfm-input pfm-price-input ${errors.price ? 'error' : ''}`}
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                  {errors.price && <span className="pfm-error">{errors.price}</span>}
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Discount %</label>
                  <div className="pfm-price-input-wrap">
                    <span className="pfm-rupee">%</span>
                    <input
                      name="discount"
                      type="number"
                      value={form.discount}
                      onChange={handleChange}
                      className="pfm-input pfm-price-input"
                      placeholder="0"
                      min="0"
                      max="90"
                    />
                  </div>
                </div>

                <div className="pfm-field">
                  <label className="pfm-label">Stock Quantity</label>
                  <input
                    name="stockQty"
                    type="number"
                    value={form.stockQty}
                    onChange={handleChange}
                    className="pfm-input"
                    placeholder="e.g. 50"
                    min="0"
                  />
                </div>

                {/* Pricing Summary */}
                {form.price && (
                  <div className="pfm-field full">
                    <div className="pfm-pricing-summary">
                      <div className="pfm-ps-row">
                        <span>Original Price</span>
                        <span>₹{form.price}/{form.unit}</span>
                      </div>
                      {form.discount > 0 && (
                        <div className="pfm-ps-row discount">
                          <span>Discount ({form.discount}%)</span>
                          <span>−₹{(parseFloat(form.price) * parseInt(form.discount) / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pfm-ps-row total">
                        <span>Final Price</span>
                        <span>₹{form.discount > 0
                          ? (parseFloat(form.price) * (1 - parseInt(form.discount) / 100)).toFixed(2)
                          : form.price}/{form.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final full card preview */}
                {/* FIX: use `preview` state instead of form.img so uploaded files show correctly */}
                <div className="pfm-field full">
                  <p className="pfm-label">Final Product Card Preview</p>
                  <div className="pfm-card-preview large">
                    <div className="pfm-preview-img-wrap">
                      <img
                        src={preview || form.img || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'}
                        alt="Preview"
                        className="pfm-preview-img"
                      />
                      {form.organic && <span className="pfm-preview-badge"> Organic</span>}
                      {form.discount > 0 && <span className="pfm-preview-discount">-{form.discount}%</span>}
                      <button className="pfm-preview-wishlist"></button>
                    </div>
                    <div className="pfm-preview-body">
                      {form.category && (
                        <span className="pfm-preview-cat">{form.category}</span>
                      )}
                      <div className="pfm-preview-name">{form.name || 'Product Name'}</div>
                      <div className="pfm-preview-farmer">
                        <span></span>
                        <div>
                          <div>{form.farmer || 'Farmer Name'}</div>
                          <div className="pfm-preview-loc"> {form.location || 'Location'}</div>
                        </div>
                      </div>
                      <div className="pfm-preview-stars"> <span>New Listing</span></div>
                      <div className="pfm-preview-footer">
                        <div>
                          <div className="pfm-preview-price">
                            ₹{form.discount > 0
                              ? (parseFloat(form.price || 0) * (1 - parseInt(form.discount) / 100)).toFixed(0)
                              : (form.price || '0')}
                            <span> / {form.unit}</span>
                          </div>
                          {form.discount > 0 && (
                            <div className="pfm-preview-original">₹{form.price}/{form.unit}</div>
                          )}
                          <div className={`pfm-preview-stock ${form.stock ? 'in' : 'out'}`}>
                            {form.stock ? ' In Stock' : ' Out of Stock'}
                          </div>
                        </div>
                        <button className="pfm-preview-cart"></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pfm-footer">
          {step > 1 && (
            <button className="pfm-back-btn" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          <div className="pfm-footer-right">
            <button className="pfm-cancel-btn" onClick={onClose}>Cancel</button>
            {step < 3 ? (
              <button className="pfm-next-btn" onClick={() => {
                if (step === 1) {
                  const errs = {};
                  if (!form.name.trim()) errs.name = 'Product name is required';
                  if (!form.category) errs.category = 'Please select a category';
                  if (!form.farmer.trim()) errs.farmer = 'Farmer name is required';
                  if (Object.keys(errs).length > 0) { setErrors(errs); return; }
                }
                setStep(s => s + 1);
              }}>
                Continue →
              </button>
            ) : (
              <button
                className={`pfm-submit-btn ${success ? 'success' : ''}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {success
                  ? ' Saved!'
                  : submitting
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="pfm-spinner" /> Saving...
                      </span>
                    : isEdit ? ' Save Changes' : ' Publish Product'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}