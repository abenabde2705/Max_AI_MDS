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
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  title, 
  price, 
  priceLabel = '',
  description, 
  features, 
  buttonText, 
  buttonStyle = 'primary', 
  highlight = false 
}) => {
  return (
    <div className={`relative px-8 py-10 rounded-[30px] w-[350px] min-h-[550px] flex flex-col text-center transition-all duration-300 shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23),0_0_5px_#651E79_inset] ${
      highlight 
        ? 'bg-gradient-purple border-[3px] border-transparent bg-origin-border bg-clip-padding scale-105 shadow-[0_12px_40px_rgba(80,200,220,0.3)] hover:-translate-y-2 hover:scale-[1.07]' 
        : 'bg-transparent hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)]'
    }`}
    style={highlight ? {
      backgroundImage: 'linear-gradient(180deg, #161A4D 0%, #470059 69.71%, #651E79 100%), linear-gradient(to bottom, #DAE63D, #161A4D)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    } : undefined}>
      {!highlight && (
        <div className="absolute inset-0 rounded-[30px] p-[3px] bg-gradient-to-b from-[#161A4D] to-transparent pointer-events-none" style={{
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}></div>
      )}
      <h2 className="text-[1.8rem] font-bold text-white mb-6 font-['Ubuntu',sans-serif]">{title}</h2>
      
      <div className="flex items-baseline justify-center gap-1 my-6 min-h-[60px]">
        <span className="text-[2.5rem] font-bold text-white font-['Ubuntu',sans-serif]">{price}</span>
        {priceLabel && <span className="text-xl text-white ml-1 font-normal font-['Ubuntu',sans-serif]">{priceLabel}</span>}
      </div>
      
      <p className="text-base text-white mb-6 leading-relaxed min-h-[48px] font-['Ubuntu',sans-serif]">{description}</p>
      
      <hr className="border-none border-t-2 border-white/30 my-6 w-4/5 self-center" />
      
      <ul className="list-none p-0 my-4 flex-grow text-left">
        {features.map((feature, index) => (
          <li key={index} className={`text-base text-white mb-3 leading-normal flex items-start gap-2 font-['Ubuntu',sans-serif] ${feature === '' ? 'h-2 m-0' : feature.includes('Fonctionnalités') ? 'font-semibold mb-4 mt-2 justify-start' : ''}`}>
            {feature && !feature.includes('Fonctionnalités') && <span className="text-white text-xl font-bold flex-shrink-0">✓</span>}
            {feature && <span className={feature.includes('Fonctionnalités') ? 'text-left' : ''}>{feature}</span>}
          </li>
        ))}
      </ul>
      
      {buttonText && (
        <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-200 font-ubuntu ${
          buttonStyle === 'primary' 
            ? 'bg-primary-yellow text-purple-dark hover:bg-primary-yellow-dark hover:shadow-card' 
            : 'bg-transparent text-primary-yellow border border-primary-yellow hover:bg-primary-yellow/10'
        }`}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default PlanCard;