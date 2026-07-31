import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { getVehicleImages, getVehicleTags, calculateEMI, DEFAULT_VEHICLE_IMAGE } from '../utils/vehicleUtils';
import {
  Car,
  Zap,
  Gauge,
  Fuel,
  Settings,
  Users,
  Compass,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Send,
  Heart,
  Scale,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Edit,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  allVehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onPurchase: (id: string) => Promise<void>;
  onEdit?: (vehicle: Vehicle) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (vehicle: Vehicle) => void;
  isCompared?: boolean;
  onToggleCompare?: (vehicle: Vehicle) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  allVehicles,
  onSelectVehicle,
  onPurchase,
  onEdit,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
}) => {
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'financing' | 'testdrive'>('overview');

  // Financing Calculator state
  const [downPayment, setDownPayment] = useState<number>(10000);
  const [loanTerm, setLoanTerm] = useState<number>(60); // 60 months
  const [interestRate, setInterestRate] = useState<number>(6.5); // 6.5%

  // Test Drive Form state
  const [testDriveName, setTestDriveName] = useState('');
  const [testDriveEmail, setTestDriveEmail] = useState('');
  const [testDrivePhone, setTestDrivePhone] = useState('');
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveNotes, setTestDriveNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  if (!vehicle) return null;

  const images = getVehicleImages(vehicle);
  const tags = getVehicleTags(vehicle);

  // Similar cars (same category or make excluding current)
  const similarCars = allVehicles
    .filter((v) => v.id !== vehicle.id && (v.category === vehicle.category || v.make === vehicle.make))
    .slice(0, 3);

  // EMI Calculation
  const emi = calculateEMI(vehicle.price, downPayment, interestRate, loanTerm);

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDriveName || !testDriveEmail || !testDrivePhone) {
      showToast('Please fill in required contact fields', 'error');
      return;
    }

    setSubmittingInquiry(true);
    try {
      const res = await fetch('/api/vehicles/public/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          userName: testDriveName,
          userEmail: testDriveEmail,
          userPhone: testDrivePhone,
          type: 'Test Drive',
          preferredDate: testDriveDate || 'As soon as possible',
          notes: testDriveNotes,
        }),
      });

      if (!res.ok) throw new Error('Inquiry failed to send');

      showToast(`TEST DRIVE BOOKED FOR ${vehicle.make} ${vehicle.model}!`, 'success');
      setTestDriveName('');
      setTestDriveEmail('');
      setTestDrivePhone('');
      setTestDriveDate('');
      setTestDriveNotes('');
      setActiveTab('overview');
    } catch (err: any) {
      showToast(err.message || 'Error submitting booking', 'error');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${vehicle.year || 2024} ${vehicle.make} ${vehicle.model}`} maxWidth="max-w-5xl">
      <div className="flex flex-col gap-6">
        {/* Top Header Bar & Action Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-[#0F1B2D] pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="blue">{vehicle.category}</Badge>
            <Badge variant="yellow">{vehicle.condition || 'New'}</Badge>
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="green">
                {tag}
              </Badge>
            ))}
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border-2 border-[#0F1B2D] px-2 py-0.5">
              VIN: {vehicle.vin || 'WP0AF2A91RS298011'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onEdit && (
              <Button
                variant="white"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(vehicle);
                }}
                className="flex items-center gap-1.5"
              >
                <Edit className="w-4 h-4 stroke-[3px]" />
                EDIT RECORD (ADMIN)
              </Button>
            )}

            {onToggleWishlist && (
              <Button
                variant={isWishlisted ? 'red' : 'white'}
                size="sm"
                onClick={() => onToggleWishlist(vehicle)}
                className="flex items-center gap-1.5"
              >
                <Heart className={`w-4 h-4 stroke-[3px] ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'WISHLISTED' : 'WISHLIST'}
              </Button>
            )}

            {onToggleCompare && (
              <Button
                variant={isCompared ? 'yellow' : 'white'}
                size="sm"
                onClick={() => onToggleCompare(vehicle)}
                className="flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4 stroke-[3px]" />
                {isCompared ? 'COMPARING' : 'COMPARE'}
              </Button>
            )}
          </div>
        </div>

        {/* Gallery & Main Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Image & Selector */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="relative border-4 border-[#0F1B2D] brutal-shadow-lg bg-black rounded-none overflow-hidden group h-72 sm:h-80">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
                }}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#0F1B2D] text-[#FFE500] p-1.5 border-2 border-[#0F1B2D] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[3px]" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F1B2D] text-[#FFE500] p-1.5 border-2 border-[#0F1B2D] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 stroke-[3px]" />
                  </button>
                </>
              )}

              {/* Stock Badge Overlay */}
              <div className="absolute top-3 right-3">
                <Badge variant={vehicle.quantity > 0 ? 'green' : 'red'}>
                  {vehicle.quantity > 0 ? `IN STOCK (${vehicle.quantity})` : 'SOLD OUT'}
                </Badge>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`border-3 ${
                      activeImageIndex === idx ? 'border-[#E8A020] ring-2 ring-[#0F1B2D]' : 'border-[#0F1B2D] opacity-70 hover:opacity-100'
                    } bg-black h-16 w-20 flex-shrink-0 cursor-pointer overflow-hidden transition-all`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx}`}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Quick Specs Box */}
          <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 border-4 border-[#0F1B2D] p-5 brutal-shadow">
            <div>
              <div className="text-xs font-black uppercase text-neutral-500 tracking-wider">
                {vehicle.make} • {vehicle.variant || 'Standard Trim'}
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D] leading-none mb-3">
                {vehicle.model}
              </h2>

              <div className="bg-[#0F1B2D] text-white p-3 mb-4 border-3 border-[#0F1B2D] flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
                  OFFERING PRICE
                </span>
                <span className="text-2xl font-black font-mono text-[#10B981]">
                  ${vehicle.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* EMI Quick Estimate Banner */}
              <div className="bg-[#FFE500] text-[#0F1B2D] border-3 border-[#0F1B2D] p-3 mb-4 flex items-center justify-between brutal-shadow-sm">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider">EST. FINANCING FROM</div>
                  <div className="text-lg font-black font-mono">
                    ${Math.round(emi.monthlyPayment)} / MO
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('financing')}
                  className="bg-[#0F1B2D] text-white text-xs font-extrabold uppercase px-2.5 py-1.5 border-2 border-[#0F1B2D] hover:bg-slate-800 cursor-pointer"
                >
                  CALCULATE
                </button>
              </div>

              {/* Core Highlights list */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
                <div className="bg-white border-2 border-[#0F1B2D] p-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#E8A020] stroke-[3px]" />
                  <span>{vehicle.horsepower || 350} HP</span>
                </div>
                <div className="bg-white border-2 border-[#0F1B2D] p-2 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-[#10B981] stroke-[3px]" />
                  <span>{vehicle.fuelType || 'Gasoline'}</span>
                </div>
                <div className="bg-white border-2 border-[#0F1B2D] p-2 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#3B82F6] stroke-[3px]" />
                  <span>{vehicle.transmission || 'Automatic'}</span>
                </div>
                <div className="bg-white border-2 border-[#0F1B2D] p-2 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#DC2626] stroke-[3px]" />
                  <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} MI` : '0 MI'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-6">
              <Button
                variant={vehicle.quantity > 0 ? 'yellow' : 'white'}
                disabled={vehicle.quantity <= 0}
                onClick={async () => {
                  await onPurchase(vehicle.id);
                }}
                className="w-full flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5 stroke-[3px]" />
                {vehicle.quantity > 0 ? 'PURCHASE VEHICLE NOW' : 'OUT OF STOCK'}
              </Button>

              <Button
                variant="green"
                onClick={() => setActiveTab('testdrive')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5 stroke-[3px]" />
                BOOK TEST DRIVE
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Full Specs | Financing Calculator | Book Test Drive */}
        <div className="border-t-3 border-[#0F1B2D] pt-4">
          <div className="flex items-center gap-2 border-b-3 border-[#0F1B2D] mb-4 overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-black text-xs uppercase border-t-3 border-x-3 border-[#0F1B2D] cursor-pointer transition-colors ${
                activeTab === 'overview' ? 'bg-[#FFE500] text-[#0F1B2D]' : 'bg-white text-neutral-600 hover:bg-slate-100'
              }`}
            >
              FULL SPECIFICATION SHEET
            </button>
            <button
              onClick={() => setActiveTab('financing')}
              className={`px-4 py-2 font-black text-xs uppercase border-t-3 border-x-3 border-[#0F1B2D] cursor-pointer transition-colors ${
                activeTab === 'financing' ? 'bg-[#FFE500] text-[#0F1B2D]' : 'bg-white text-neutral-600 hover:bg-slate-100'
              }`}
            >
              FINANCING & EMI CALCULATOR
            </button>
            <button
              onClick={() => setActiveTab('testdrive')}
              className={`px-4 py-2 font-black text-xs uppercase border-t-3 border-x-3 border-[#0F1B2D] cursor-pointer transition-colors ${
                activeTab === 'testdrive' ? 'bg-[#FFE500] text-[#0F1B2D]' : 'bg-white text-neutral-600 hover:bg-slate-100'
              }`}
            >
              BOOK TEST DRIVE / INQUIRE
            </button>
          </div>

          {/* TAB 1: FULL SPECIFICATIONS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">ENGINE TYPE</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.engineType || 'V6 Turbo'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">ENGINE DISPLACEMENT</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.engineDisplacement || '3.0L'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">HORSEPOWER</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.horsepower || 350} HP</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">TRANSMISSION</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.transmission || 'Automatic'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">FUEL TYPE</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.fuelType || 'Gasoline'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">DRIVETRAIN</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.drivetrain || 'AWD'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">SEATING CAPACITY</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.seatingCapacity || 5} Passengers</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">ODOMETER / MILEAGE</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} Miles` : '0 Miles (Brand New)'}</div>
              </div>
              <div className="border-2 border-[#0F1B2D] p-3 bg-white">
                <span className="text-[10px] font-black uppercase text-neutral-500">VEHICLE CONDITION</span>
                <div className="text-sm font-black font-mono text-[#0F1B2D]">{vehicle.condition || 'New'}</div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCING CALCULATOR */}
          {activeTab === 'financing' && (
            <div className="bg-slate-50 border-3 border-[#0F1B2D] p-5">
              <h3 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#10B981] stroke-[3px]" />
                CUSTOM LOAN & EMI ESTIMATOR
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  {/* Down Payment Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-extrabold uppercase text-[#0F1B2D]">
                        DOWN PAYMENT ($)
                      </label>
                      <span className="font-mono font-black text-sm text-[#10B981]">
                        ${downPayment.toLocaleString()} ({Math.round((downPayment / vehicle.price) * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={vehicle.price * 0.8}
                      step={1000}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full accent-[#0F1B2D] cursor-pointer"
                    />
                  </div>

                  {/* Loan Term Selection */}
                  <div>
                    <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-2">
                      LOAN DURATION (MONTHS)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[24, 36, 48, 60, 72].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setLoanTerm(term)}
                          className={`py-2 text-xs font-black font-mono border-2 border-[#0F1B2D] cursor-pointer ${
                            loanTerm === term ? 'bg-[#0F1B2D] text-[#FFE500]' : 'bg-white text-[#0F1B2D]'
                          }`}
                        >
                          {term} MO
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Rate Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-extrabold uppercase text-[#0F1B2D]">
                        ESTIMATED INTEREST RATE (%)
                      </label>
                      <span className="font-mono font-black text-sm text-[#3B82F6]">
                        {interestRate}% APR
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2.0}
                      max={15.0}
                      step={0.25}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-[#0F1B2D] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculated Result Card */}
                <div className="bg-[#0F1B2D] text-white border-3 border-[#0F1B2D] p-5 flex flex-col justify-between brutal-shadow">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
                      ESTIMATED MONTHLY PAYMENT
                    </span>
                    <div className="text-4xl font-black font-mono text-[#10B981] my-2">
                      ${Math.round(emi.monthlyPayment).toLocaleString()}
                      <span className="text-sm text-slate-300 font-sans"> / mo</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-700 pt-3 text-xs font-mono flex flex-col gap-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span>VEHICLE LIST PRICE:</span>
                      <span className="font-bold text-white">${vehicle.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOWN PAYMENT APPLIED:</span>
                      <span className="font-bold text-[#10B981]">-${downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TOTAL FINANCED AMOUNT:</span>
                      <span className="font-bold text-white">${emi.totalLoanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EST. TOTAL INTEREST ({loanTerm} MOS):</span>
                      <span className="font-bold text-[#FFE500]">${Math.round(emi.totalInterest).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOK TEST DRIVE FORM */}
          {activeTab === 'testdrive' && (
            <form onSubmit={handleTestDriveSubmit} className="bg-white border-3 border-[#0F1B2D] p-5">
              <h3 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D] mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E8A020] stroke-[3px]" />
                SCHEDULE VIP TEST DRIVE OR REQUEST OFFICIAL QUOTE
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-1">
                    YOUR FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={testDriveName}
                    onChange={(e) => setTestDriveName(e.target.value)}
                    placeholder="John Doe"
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={testDriveEmail}
                    onChange={(e) => setTestDriveEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-1">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={testDrivePhone}
                    onChange={(e) => setTestDrivePhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-1">
                    PREFERRED DATE
                  </label>
                  <input
                    type="date"
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="brutal-input w-full"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-extrabold uppercase text-[#0F1B2D] block mb-1">
                  ADDITIONAL COMMENTS / SPECIFIC QUESTIONS
                </label>
                <textarea
                  rows={2}
                  value={testDriveNotes}
                  onChange={(e) => setTestDriveNotes(e.target.value)}
                  placeholder="I am interested in trade-in evaluation or home delivery..."
                  className="brutal-input w-full"
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="green"
                disabled={submittingInquiry}
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 stroke-[3px]" />
                {submittingInquiry ? 'SENDING BOOKING...' : 'CONFIRM VIP TEST DRIVE REQUEST'}
              </Button>
            </form>
          )}
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <div className="border-t-3 border-[#0F1B2D] pt-4 mt-2">
            <h3 className="text-base font-black uppercase tracking-tight text-[#0F1B2D] mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E8A020] stroke-[3px]" />
              SIMILAR MATCHES YOU MIGHT LIKE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similarCars.map((simCar) => {
                const simImg = getVehicleImages(simCar)[0];
                return (
                  <button
                    key={simCar.id}
                    onClick={() => {
                      onSelectVehicle(simCar);
                      setActiveImageIndex(0);
                      setActiveTab('overview');
                    }}
                    className="border-3 border-[#0F1B2D] bg-white p-2.5 text-left hover:-translate-y-1 hover:brutal-shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-28 bg-black mb-2 overflow-hidden border border-[#0F1B2D]">
                      <img src={simImg} alt={simCar.model} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-500">{simCar.make}</div>
                      <div className="text-sm font-black uppercase truncate text-[#0F1B2D]">{simCar.model}</div>
                      <div className="text-xs font-black font-mono text-[#10B981] mt-1">
                        ${simCar.price.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
