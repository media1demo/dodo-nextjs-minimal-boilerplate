"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  product_id: number;
  name: string;
  description: string;
  price: number;
  is_recurring: boolean;
  features?: string[];
  tier?: "basic" | "standard" | "premium";
  originalPrice?: number;
  socialProof?: string;
  additionalFeatures?: string[];
};

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkoutProduct = async (productId: number, is_recurring: boolean, useDynamicPaymentLinks: boolean) => {
    if (useDynamicPaymentLinks) {
      setLoading(true);
      let productType = "onetime";
      if (is_recurring) {
        productType = "subscription";
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/${productType}?productId=${productId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      router.push(data.payment_link);
    } else {
      let checkoutUrl = `https://test.checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${process.env.NEXT_PUBLIC_BASE_URL}`;
      router.push(checkoutUrl);
    }
  };

  // Determine button text based on product tier
  const getButtonText = (tier?: string) => {
    if (loading) return "Processing...";
    
    switch (tier) {
      case "basic": return "Start Simple";
      case "standard": return "Go Pro";
      case "premium": return "Unlock Everything";
      default: return "Buy Now";
    }
  };

  const isPremium = product.tier === "premium";

  return (
    <div className={`relative m-5 p-5 w-72 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-2 
      ${isPremium 
        ? "bg-gradient-to-br from-[#040207] to-[#0b060f] border-2 border-[#ffd700] scale-105 shadow-[0_0_15px_rgba(255,215,0,0.6)]" 
        : "bg-[#07070e] shadow-lg hover:shadow-xl"}`}
    >
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-[#ffd700] text-black font-bold px-3 py-1 rounded-md rotate-12 shadow-md">
          Best Value
        </div>
      )}
      
      <h3 className={`text-2xl mb-4 ${isPremium ? "text-[#ffd700]" : "text-white"}`}>
        {product.name}
      </h3>
      
      <div className="mb-5">
        {isPremium && product.originalPrice ? (
          <div>
            <span className="line-through text-xl text-[#ff6b81] mr-2">${product.originalPrice/100}</span>
            <span className={`text-3xl font-bold ${isPremium ? "text-[#ffd700]" : "text-[#00a8ff]"}`}>
              ${product.price/100}
            </span>
          </div>
        ) : (
          <p className={`text-3xl font-bold ${isPremium ? "text-[#ffd700]" : "text-[#00a8ff]"}`}>
            ${product.price/100}
          </p>
        )}
      </div>
      
      <ul className="list-none mb-5">
        {product.features?.map((feature, index) => (
          <li key={index} className="text-[#ddd] mb-2">{feature}</li>
        ))}
      </ul>
      
      <button
        onClick={() => checkoutProduct(product.product_id, product.is_recurring, false)}
        disabled={loading}
        className={`w-full py-3 px-5 rounded-lg font-medium transition-all duration-300
          ${isPremium 
            ? "bg-gradient-to-r from-[#ffd700] to-[#ffa500] text-black hover:from-[#ffa500] hover:to-[#ff8c00]" 
            : "bg-gradient-to-r from-[#040207] to-[#0b060f] text-white hover:bg-gradient-to-r hover:from-[#007bff] hover:to-[#0056b3]"}`}
      >
        {getButtonText(product.tier)}
      </button>
      
      {isPremium && product.socialProof && (
        <div className="mt-3 text-sm text-[#ddd]">
          {product.socialProof}
        </div>
      )}
      
      {isPremium && product.additionalFeatures && (
        <div className="mt-4 text-sm text-[#ddd]">
          {product.additionalFeatures.map((feature, index) => (
            <div key={index}><span className="text-[#ffd700] font-bold">✓</span> {feature}</div>
          ))}
        </div>
      )}
      
      {isPremium && (
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-[#ff4757] text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
          Limited Time Offer!
        </div>
      )}
    </div>
  );
}