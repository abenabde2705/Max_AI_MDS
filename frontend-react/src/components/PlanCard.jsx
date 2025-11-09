import React from 'react';

const PlanCard = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  buttonStyle = 'primary', 
  highlight = false 
}) => {
  return (
    <div className={`plan-card ${highlight ? 'highlight' : ''}`}>
      <ul className="plan-maininfo"> 
        <h2 className="plan-title">{title}</h2>
        <p className="plan-price">{price}</p>
        <p className="plan-description">{description}</p>
      </ul>
      
      <ul className="plan-features">
        {features.map((feature, index) => (
          <li key={index}>
            <span className="tick-icon">✓</span> {feature}
          </li>
        ))}
      </ul>
      
      <button className={`plan-button ${buttonStyle}`}>
        {buttonText}
      </button>
    </div>
  );
};

export default PlanCard;