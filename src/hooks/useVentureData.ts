import { useEffect, useState } from "react";

export interface VentureAlternative {
  id: string;
  name: string;
  type: string;
  priceCost: string;
  mainOffer: string;
  mainStrength: string;
  mainWeakness: string;
}

export interface VentureBackupDocument {
  venture?: {
    ventureName?: string;
    ventureIdea?: string;
    mission0?: {
      problemSolved?: string;
      initialCustomer?: string;
      geography?: string;
    };
    mission2?: {
      functionalJob?: string;
      emotionalJob?: string;
      socialJob?: string;
      primaryJTBD?: {
        situation?: string;
        motivationAction?: string;
        desiredOutcome?: string;
      };
    };
    mission3?: {
      beachheadSegment?: string;
      geography?: string;
      willingnessToPay?: string;
    };
    mission5?: {
      alternatives?: VentureAlternative[];
      desiredAssociatedPosition?: string;
    };
    mission7?: {
      revenueModel?: string;
      sellingPrice?: number;
    };
    mission9?: {
      coreMessage?: string;
      callToAction?: string;
    };
    mission10?: {
      coreAssumptionTested?: string;
      successMetric?: string;
    };
  };
}

const DEFAULT_VENTURE_DATA: VentureBackupDocument = {
  venture: {
    ventureName: "Glamguard",
    ventureIdea:
      "GlamGuard is a beauty-tech application designed to provide personalized, situation-based beauty solutions for people in Kolkata.",
    mission0: {
      geography:
        "Kolkata, West Bengal, initially focusing on New Town, Salt Lake, Park Street, Ballygunge, Gariahat and South Kolkata.",
      initialCustomer:
        "Women aged 18–35 in Kolkata, particularly college students, young professionals, working women, wedding guests and frequent Durga Puja/event attendees.",
    },
    mission5: {
      alternatives: [
        {
          id: "alt-1",
          name: "Nykaa",
          type: "Indirect Competitor",
          priceCost: "₹100–₹2,000+ per product",
          mainOffer: "Online beauty marketplace and product discovery",
          mainStrength: "Wide product selection for shopping",
          mainWeakness:
            "Focused on buying products rather than solving an immediate real-time beauty problem.",
        },
        {
          id: "alt-2",
          name: "Purplle",
          type: "Indirect Competitor",
          priceCost: "₹100–₹2,000+ per product",
          mainOffer: "Online beauty store with general beauty guidance",
          mainStrength: "Product discovery paired with tips",
          mainWeakness:
            "Not built around an immediate, time-limited beauty emergency while you are out.",
        },
        {
          id: "alt-3",
          name: "Urban Company – Beauty Services",
          type: "Substitute",
          priceCost: "Hundreds to thousands per service",
          mainOffer: "At-home salon and styling appointments",
          mainStrength: "Hands-on professional service at home",
          mainWeakness:
            "Requires booking and waiting—unnecessary when you just need a quick 5–20 minute fix.",
        },
      ],
    },
    mission7: {
      revenueModel: "Freemium + Paid",
      sellingPrice: 99,
    },
    mission9: {
      coreMessage:
        "Makeup melting, hair getting frizzy or skin looking oily? Get a personalized beauty rescue plan in minutes with GlamGuard.",
      callToAction:
        "Get your personalized Beauty Rescue Plan.",
    },
    mission10: {
      successMetric:
        "At least 15 of 50 pilot users use the Beauty Rescue Plan and at least 30% indicate willingness to pay ₹99 per month.",
    },
  },
};

const BACKUP_ASSET_URL = "/assets/aistudio/Glamguard_Backup_2026-09-30__1__168837fc.json";

export function useVentureData() {
  const [data, setData] = useState<VentureBackupDocument>(DEFAULT_VENTURE_DATA);

  useEffect(() => {
    let active = true;
    fetch(BACKUP_ASSET_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: VentureBackupDocument | null) => {
        if (active && json?.venture) {
          setData(json);
        }
      })
      .catch(() => {
        // Fallback defaults remain active
      });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
