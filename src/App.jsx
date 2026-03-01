import { useState, useEffect } from 'react';
import { Heart, Coins, ChevronRight, CheckCircle2, User, Home, FileText, Check, Activity, ShieldCheck, Mail } from 'lucide-react';
import './index.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    familyId: '',
    name: '',
    fatherName: '',
    address: '',
    status: 'Active',
    amount: '',
    paymentMethod: 'cash'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && formData.amount) {
      setStep(2);
    } else if (step === 2 && formData.name && formData.familyId && formData.fatherName && formData.address) {
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const presetAmounts = [10, 25, 50, 100, 500];

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      {/* Header */}
      <header className="content-wrapper" style={{ flex: 'none', paddingBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
              <Heart size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Community<span className="text-gradient">Care</span></h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
        
        {isSuccess ? (
          <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="text-gradient-alt">Donation Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Thank you, {formData.name}, for your generous contribution of {formData.amount}. Your support means the world to our community.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Family ID</span>
                <span style={{ fontWeight: '500' }}>{formData.familyId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Father's Name</span>
                <span style={{ fontWeight: '500' }}>{formData.fatherName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{formData.paymentMethod}</span>
              </div>
            </div>
            <button onClick={() => { setStep(1); setIsSuccess(false); setFormData({ ...formData, amount: '' }); }} className="btn btn-outline" style={{ width: '100%' }}>
              Make Another Donation
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Hero Section (only on step 1) */}
            {step === 1 && (
              <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1.5rem' }}>
                  Empower Change with <br />
                  <span className="text-gradient">Your Generosity</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                  Join our mission to support families in need. Every contribution brings hope and builds a stronger foundation for our community's future.
                </p>
              </div>
            )}

            {/* Donation Workflow */}
            <div className="glass-panel animate-fade-in delay-100" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
              
              {/* Progress Steps */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--glass-border)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '0', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', height: '2px', background: 'var(--accent-primary)', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.5s ease' }}></div>
                
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{ 
                    position: 'relative', zIndex: 1, 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step >= s ? 'var(--accent-primary)' : 'var(--bg-dark)',
                    border: `2px solid ${step >= s ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    color: step >= s ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                    boxShadow: step >= s ? '0 0 15px rgba(139, 92, 246, 0.5)' : 'none'
                  }}>
                    {step > s ? <Check size={20} /> : s}
                  </div>
                ))}
              </div>

              {/* Step 1: Amount */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Select Amount</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose an amount to donate today.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {presetAmounts.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({...formData, amount: preset.toString()})}
                        className={`btn ${formData.amount === preset.toString() ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '1rem' }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom Amount</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        name="amount"
                        value={formData.amount} 
                        onChange={handleChange}
                        className="form-control" 
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={!formData.amount || Number(formData.amount) <= 0}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', opacity: (!formData.amount || Number(formData.amount) <= 0) ? 0.5 : 1 }}
                  >
                    Continue to Details <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Family Details</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please provide the required family information.</p>
                  
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Family ID</label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="familyId" value={formData.familyId} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="E.g. FAM-1029" required />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <div style={{ position: 'relative' }}>
                        <Activity size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <select name="status" value={formData.status} onChange={handleChange} style={{ paddingLeft: '2.75rem', appearance: 'none' }} className="form-control">
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Review">Review</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input name="name" value={formData.name} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="John Doe" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Father's Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input name="fatherName" value={formData.fatherName} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} className="form-control" placeholder="Robert Doe" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <div style={{ position: 'relative' }}>
                      <Home size={18} style={{ position: 'absolute', left: '1rem', top: '20px', color: 'var(--text-muted)' }} />
                      <textarea name="address" value={formData.address} onChange={handleChange} style={{ paddingLeft: '2.75rem', minHeight: '100px', resize: 'vertical' }} className="form-control" placeholder="Full residential address" required></textarea>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                      Back
                    </button>
                    <button 
                      onClick={handleNext} 
                      disabled={!formData.name || !formData.familyId || !formData.fatherName || !formData.address}
                      className="btn btn-primary" style={{ flex: 2 }}
                    >
                      Payment Method <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment (Cash Only) */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Complete Donation</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Review and confirm your cash payment details.</p>
                  
                  <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.75rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                      <Coins size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Cash Payment Mode</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your contribution of <strong>{formData.amount}</strong> will be collected in person.</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <ShieldCheck size={24} color="var(--accent-success)" />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Summary</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Donor</span>
                      <span>{formData.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Family ID</span>
                      <span>{formData.familyId}</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.25rem' }}>
                      <span>Total Amount</span>
                      <span className="text-gradient">{formData.amount}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }} disabled={isSubmitting}>
                      Back
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm Cash Payment'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
