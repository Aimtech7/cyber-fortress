import React, { useState } from "react";
import { UserAcademyProfile } from "../types/academy";
import { GAMIFICATION_SHOP } from "../data/learningEngineData";
import { ShopItem } from "../types/learningEngine";
import { 
  ShoppingBag, 
  Coins, 
  Award, 
  Paintbrush, 
  Layout, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

interface AcademyShopProps {
  profile: UserAcademyProfile;
  coins: number;
  inventory: string[];
  activeTitle: string;
  onBuyItem: (item: ShopItem) => void;
  onEquipTitle: (title: string) => void;
  onEquipBanner: (bannerClass: string) => void;
  theme?: "light" | "dark";
}

export default function AcademyShop({
  profile,
  coins,
  inventory,
  activeTitle,
  onBuyItem,
  onEquipTitle,
  onEquipBanner,
  theme = "light"
}: AcademyShopProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const categories = ["All", "title", "banner", "theme", "hint"];

  const filteredItems = activeCategory === "All"
    ? GAMIFICATION_SHOP
    : GAMIFICATION_SHOP.filter(item => item.category === activeCategory);

  const handleBuy = (item: ShopItem) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    if (inventory.includes(item.id) && item.category !== "hint") {
      setPurchaseError("You already own this digital asset!");
      return;
    }

    if (coins < item.cost) {
      setPurchaseError(`Insufficient coin reserves. You require ${item.cost - coins} more coins.`);
      return;
    }

    onBuyItem(item);
    setPurchaseSuccess(`✓ Secure Transaction Approved! Unlocked: ${item.title}`);
  };

  const isEquipped = (item: ShopItem) => {
    if (item.category === "title") {
      return activeTitle === item.value;
    }
    // We can check if dashboard banner class matches item value in the parent
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in text-left" id="academy-shop-view">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200/10 pb-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"} flex items-center gap-2`}>
            <ShoppingBag className="h-5.5 w-5.5 text-amber-500 shrink-0" />
            Academy clearance Store
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Spend your earned SecOps coins to acquire custom titles, layout overlays, and hint tools.</p>
        </div>

        {/* Coin Reserve HUD */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-amber-50 border-amber-200"
        }`}>
          <Coins className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-500 block font-mono font-bold leading-none uppercase">SecOps Coins</span>
            <span className="text-xs font-black font-mono text-amber-500 block leading-none">{coins} COINS</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Store & Inventory split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Store Catalog (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Categories Tab Bar */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer uppercase ${
                  activeCategory === cat
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : theme === "dark"
                      ? "bg-slate-900 text-slate-400 hover:text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-250 hover:text-slate-950"
                }`}
              >
                {cat === "All" ? "All Items" : cat}
              </button>
            ))}
          </div>

          {/* Feedback Blocks */}
          {purchaseSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold animate-fade-in flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 animate-bounce" />
              <span>{purchaseSuccess}</span>
            </div>
          )}
          {purchaseError && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold animate-fade-in flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse" />
              <span>{purchaseError}</span>
            </div>
          )}

          {/* Store Catalog Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const owned = inventory.includes(item.id) && item.category !== "hint";
              
              return (
                <div 
                  key={item.id}
                  className={`border rounded-2xl p-4 flex flex-col justify-between transition hover:shadow-md ${
                    theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        item.category === "title" ? "bg-blue-500/10 text-blue-400" :
                        item.category === "banner" ? "bg-purple-500/10 text-purple-400" :
                        item.category === "theme" ? "bg-pink-500/10 text-pink-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {item.category}
                      </span>
                      
                      <div className="flex items-center gap-1 font-mono text-[10px] font-extrabold text-amber-500">
                        <Coins className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.cost}</span>
                      </div>
                    </div>

                    <h3 className={`text-xs font-extrabold leading-snug ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/10 mt-4">
                    {owned ? (
                      <span className="w-full text-center py-2.5 block rounded-xl border border-dashed border-emerald-500/20 text-emerald-400 font-bold text-[10px] bg-emerald-500/5">
                        ✓ Already Acquired
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        className="w-full text-center py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        Acquire Clearance Item <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Owned Inventory (Right Column) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              <Award className="h-4 w-4 text-blue-500" /> Your SecOps Inventory
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal">
              Manage and equip your purchased clearances, custom title banners, and theme configurations.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {inventory.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-semibold text-xs border border-dashed rounded-xl border-slate-200/50 dark:border-slate-850">
                  Inventory ledger empty.
                </div>
              ) : (
                inventory.map(itemId => {
                  const item = GAMIFICATION_SHOP.find(i => i.id === itemId);
                  if (!item) return null;
                  
                  const isTitleActive = activeTitle === item.value;
                  
                  return (
                    <div key={itemId} className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/60 text-[11px] flex justify-between items-center">
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="font-bold block truncate">{item.title}</span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">[{item.category}]</span>
                      </div>

                      {item.category === "title" && (
                        <button
                          onClick={() => onEquipTitle(item.value)}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold cursor-pointer transition ${
                            isTitleActive
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {isTitleActive ? "Equipped" : "Equip"}
                        </button>
                      )}

                      {item.category === "banner" && (
                        <button
                          onClick={() => onEquipBanner(item.value)}
                          className="px-2.5 py-1 rounded text-[9px] font-bold bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white cursor-pointer transition"
                        >
                          Apply
                        </button>
                      )}

                      {item.category === "theme" && (
                        <span className="text-[9px] font-mono text-slate-500 font-bold">Unlocked</span>
                      )}

                      {item.category === "hint" && (
                        <span className="text-[9px] font-mono text-amber-500 font-bold font-mono">Consumable</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
