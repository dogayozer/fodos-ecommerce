'use client';

import React from 'react';

export function WhatsAppButton() {
  const phoneNumber = '905322324499'; 
  const message = 'Merhaba, web sitenizden ulaşıyorum. Bir ürün hakkında bilgi almak istiyorum.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
      aria-label="WhatsApp üzerinden iletişime geçin"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M12.031 2c-5.508 0-9.986 4.478-9.986 9.986 0 1.956.51 3.844 1.48 5.513L2 22l4.636-1.488c1.61.895 3.42 1.365 5.395 1.365 5.508 0 9.986-4.478 9.986-9.986 0-5.508-4.478-9.986-9.986-9.986zm5.352 14.364c-.22.623-1.282 1.182-1.782 1.282-.44.088-.992.176-2.904-.572-2.31-1.04-3.795-3.41-3.905-3.553-.11-.143-.935-1.243-.935-2.376 0-1.133.583-1.694.792-1.914.21-.22.45-.275.605-.275.154 0 .308 0 .44.011.143.011.33.055.517.506.242.583.594 1.452.65 1.562.055.11.088.242.011.396-.077.154-.121.253-.242.385-.121.132-.253.286-.363.396-.121.121-.253.253-.11.506.143.253.638 1.056 1.364 1.705.935.836 1.716 1.1 1.958 1.22.242.121.385.11.528-.055.143-.165.616-.715.781-.968.165-.253.33-.21.55-.121.22.088 1.397.66 1.639.781.242.121.407.187.462.286.055.11.055.627-.165 1.254z" />
      </svg>
    </a>
  );
}
