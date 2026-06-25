import React, { useState } from 'react';
import { successStories } from '../../data';
import './SuccessStories.css';

export default function SuccessStories() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(a => (a - 1 + successStories.length) % successStories.length);
  const next = () => setActive(a => (a + 1) % successStories.length);

  const story = successStories[active];

  return (
    <section className="section stories-section">
      <div className="container">
        <div className="stories-header">
          <p className="section-pre">Real Impact</p>
          <h2 className="section-title">Success <span>Stories</span></h2>
          <p className="stories-desc">Lives transformed through direct farmer-buyer connections.</p>
        </div>

        <div className="stories-slider">
          <div className="story-main">
            <img src={story.img} alt={story.name} className="story-img" />
            <div className="story-content">
              <div className="growth-badge"> Income Growth: {story.growth}</div>
              <blockquote className="story-quote">"{story.story}"</blockquote>
              <div className="story-meta">
                <div>
                  <div className="story-name">{story.name}</div>
                  <div className="story-location"> {story.location}</div>
                  <div className="story-product"> Grows: {story.product}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="slider-controls">
            <button className="slider-btn" onClick={prev}>←</button>
            <div className="slider-dots">
              {successStories.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === active ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
            <button className="slider-btn" onClick={next}>→</button>
          </div>

          {/* Thumbnail row */}
          <div className="stories-thumbs">
            {successStories.map((s, i) => (
              <button
                key={s.id}
                className={`story-thumb ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
              >
                <img src={s.img} alt={s.name} />
                <div>
                  <div className="thumb-name">{s.name}</div>
                  <div className="thumb-growth">{s.growth} growth</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
