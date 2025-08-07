import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check } from 'lucide-react';
import { OrderItem } from '../types';

interface PaymentModalProps {
  items: OrderItem[];
  totalAmount: number;
  tableNumber: string;
  onClose: () => void;
  onPaymentSubmit: (paymentData: { screenshot: File; method: string }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  items,
  totalAmount,
  tableNumber,
  onClose,
  onPaymentSubmit,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    try {
      await onPaymentSubmit({ screenshot: selectedFile, method: paymentMethod });
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Payment Confirmation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary - Table {tableNumber}</h3>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🏦 Bank Transfer
              </button>
              <button
                onClick={() => setPaymentMethod('mobile_money')}
                className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                  paymentMethod === 'mobile_money'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                📱 Mobile Money
              </button>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Screenshot</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!preview ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Click to upload payment screenshot</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Payment screenshot"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-lg transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <h4 className="font-semibold text-blue-900 mb-1">Payment Instructions:</h4>
            {paymentMethod === 'bank_transfer' ? (
              <>
                <p>• Account: 123-456-789</p>
                <p>• Bank: Example Bank</p>
                <p>• Ref: Table {tableNumber}</p>
              </>
            ) : (
              <>
                <p>• Send to: +251-912-345-678</p>
                <p>• Service: Telebirr / M-Birr</p>
                <p>• Ref: Table {tableNumber}</p>
              </>
            )}
            <p>• Upload screenshot after payment</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Confirmation'}
          </button>
        </div>
      </div>
    </div>
  );
};
