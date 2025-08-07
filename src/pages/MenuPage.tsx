import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MenuItem } from '../types';
import { MenuCard } from '../components/MenuCard';
import { MenuDetail } from '../components/MenuDetail';
import { CartModal } from '../components/CartModal';
import { BottomNav } from '../components/BottomNav';
import { CategoryFilter } from '../components/CategoryFilter';
import { TableHeader } from '../components/TableHeader';
import { SettingsModal } from '../components/SettingsModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { PaymentModal } from '../components/PaymentModal';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { googleSheetsService } from '../services/googleSheets';
import { telegramService } from '../services/telegram';
import { AnalyticsService } from '../services/analytics';
import { useTranslation } from '../utils/translations';

export const MenuPage: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [analytics] = useState(() => new AnalyticsService(tableNumber || '1'));
  const { settings, updateSettings } = useSettings();

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
  } = useCart();

  const t = useTranslation(settings.language);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await googleSheetsService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      // Fallback to demo data
      setMenuItems(getDemoMenuItems());
    } finally {
      setLoading(false);
    }
  };

  const getDemoMenuItems = (): MenuItem[] => [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, basil, and olive oil',
      price: 12.99,
      photo: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
      category: 'Pizza',
      available: true,
      preparation_time: 15,
      ingredients: 'Tomatoes, Mozzarella, Basil, Olive Oil',
      allergens: 'Gluten, Dairy',
      popularity_score: 95,
      views: 150,
      orders: 45,
      last_updated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan and croutons',
      price: 8.99,
      photo: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
      category: 'Salads',
      available: true,
      preparation_time: 5,
      ingredients: 'Romaine Lettuce, Parmesan, Croutons, Caesar Dressing',
      allergens: 'Dairy, Gluten',
      popularity_score: 88,
      views: 120,
      orders: 32,
      last_updated: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with herbs and lemon',
      price: 18.99,
      photo: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Main Course',
      available: true,
      preparation_time: 20,
      ingredients: 'Atlantic Salmon, Herbs, Lemon, Olive Oil',
      allergens: 'Fish',
      popularity_score: 92,
      views: 98,
      orders: 28,
      last_updated: new Date().toISOString(),
    },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleItemClick = (item: MenuItem) => {
    analytics.trackItemView(item.id);
    googleSheetsService.updateItemStats(item.id, 'views');
    setSelectedItem(item);
  };

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const orderId = `order_${Date.now()}_${tableNumber}`;
    setLastOrderId(orderId);

    const order = {
      tableNumber: tableNumber || '1',
      items: cartItems,
      totalAmount: getTotalAmount(),
      timestamp: new Date().toISOString(),
    };

    analytics.trackOrder(order);
    
    try {
      await telegramService.sendOrderNotification(order);
      clearCart();
      setShowCart(false);
      
      // Show feedback modal after successful order
      setTimeout(() => setShowFeedback(true), 2000);
      
      // Show success message
      alert(t('orderPlaced'));
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Order placed! (Note: Telegram notification may have failed)');
    }
  };

  const handlePaymentOrder = () => {
    if (cartItems.length === 0) return;
    setShowCart(false);
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (paymentData: { screenshot: File; method: string }) => {
    if (cartItems.length === 0) return;

    const orderId = `order_${Date.now()}_${tableNumber}`;
    setLastOrderId(orderId);

    const order = {
      tableNumber: tableNumber || '1',
      items: cartItems,
      totalAmount: getTotalAmount(),
      timestamp: new Date().toISOString(),
    };

    analytics.trackOrder(order);
    
    try {
      await telegramService.sendPaymentConfirmation(order, paymentData.method, paymentData.screenshot);
      clearCart();
      setShowPayment(false);
      
      // Show feedback modal after successful payment
      setTimeout(() => setShowFeedback(true), 2000);
      
      // Show success message
      alert('Payment confirmation sent! Your order will be prepared shortly.');
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Payment confirmation sent! (Note: Telegram notification may have failed)');
    }
  };
  const handleWaiterCall = async () => {
    analytics.trackWaiterCall();
    try {
      await telegramService.sendWaiterCall(tableNumber || '1');
      alert(t('waiterCalled'));
    } catch (error) {
      console.error('Error calling waiter:', error);
      alert('Waiter call registered! (Note: Telegram notification may have failed)');
    }
  };

  const handleBillRequest = async () => {
    analytics.trackBillRequest();
    try {
      await telegramService.sendBillRequest(tableNumber || '1');
      alert(t('billRequested'));
    } catch (error) {
      console.error('Error requesting bill:', error);
      alert('Bill request registered! (Note: Telegram notification may have failed)');
    }
  };

  const handleFeedbackSubmit = (feedback: any) => {
    // Store feedback locally and potentially send to analytics
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    alert(t('thankYou'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TableHeader 
        tableNumber={tableNumber || '1'} 
        language={settings.language}
        orderType={settings.orderType}
      />
      
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="p-4 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {selectedItem && (
        <MenuDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <CartModal
          items={cartItems}
          totalAmount={getTotalAmount()}
          tableNumber={tableNumber || '1'}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onPlaceOrder={handlePlaceOrder}
          onPaymentOrder={handlePaymentOrder}
        />
      )}

      {showPayment && (
        <PaymentModal
          items={cartItems}
          totalAmount={getTotalAmount()}
          tableNumber={tableNumber || '1'}
          onClose={() => setShowPayment(false)}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onUpdateSettings={updateSettings}
        />
      )}

      {showFeedback && lastOrderId && (
        <FeedbackModal
          orderId={lastOrderId}
          tableNumber={tableNumber || '1'}
          language={settings.language}
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onWaiterCall={handleWaiterCall}
        onBillRequest={handleBillRequest}
        onCartClick={() => setShowCart(true)}
        onSettingsClick={() => setShowSettings(true)}
        cartItemCount={getTotalItems()}
        language={settings.language}
      />
    </div>
  );
};