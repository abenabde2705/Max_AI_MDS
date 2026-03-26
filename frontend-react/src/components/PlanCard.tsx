import React from 'react';

interface PlanCardProps {
  title: string;
  price: string;
  priceLabel?: string;
  description: string;
  features: string[];
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'free' | 'campus';
  highlight?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  priceLabel = '',
  description,
  features,
  buttonText,
  buttonStyle = 'primary',
  highlight = false,
  onClick,
  disabled = false,
  isActive = false
}) => {
  return (
    <div className={`plan-card ${highlight ? 'highlight' : ''} ${buttonStyle}`}>
      <h2 className="plan-title">{title}</h2>

      <div className="plan-price-container">
        <span className="plan-price">{price}</span>
        {priceLabel && <span className="plan-price-label">{priceLabel}</span>}
      </div>

      <p className="plan-description">{description}</p>

      <hr className="plan-divider" />

      <ul className="plan-features">
        {features.map((feature, index) => (
          <li key={index} className={feature === '' ? 'empty-line' : feature.includes('Fonctionnalités') ? 'feature-header' : ''}>
            {feature && !feature.includes('Fonctionnalités') && <span className="tick-icon">✓</span>}
            {feature && <span>{feature}</span>}
          </li>
        ))}
      </ul>

      {isActive ? (
        <div className="plan-active-badge">Plan actif</div>
      ) : (
        buttonText && (
          <button
            className={`plan-button ${buttonStyle}`}
            onClick={onClick}
            disabled={disabled}
          >
            {buttonText}
          </button>
        )
      )}
    </div>
  );
};

export default PlanCard;