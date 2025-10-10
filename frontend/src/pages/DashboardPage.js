import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import FloatingNavbar from '../components/FloatingNavbar';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  Image, 
  Settings, 
  LogOut, 
  Save,
  Plus,
  Trash2,
  User,
  Clock,
  Link as LinkIcon,
  Upload,
  Edit3,
  CheckCircle,
  // Removed Monitor and Smartphone imports - no longer needed
  QrCode,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Camera,
  Star,
  Music,
  Utensils,
  Phone
} from 'lucide-react';

// Import homepage components for mini preview
import HomePage from './HomePage';
import StoryPage from './StoryPage';
import SchedulePage from './SchedulePage';
import GalleryPage from './GalleryPage';
import PartyPage from './PartyPage';
import RSVPPage from './RSVPPage';
import RegistryPage from './RegistryPage';
import FAQPage from './FAQPage';
import GuestbookPage from './GuestbookPage';
import QRCodeGenerator from '../components/QRCodeGenerator';
import RegistryAdminContent from '../components/RegistryAdminContent';

const DashboardPage = () => {
  const { themes, currentTheme, setCurrentTheme } = useAppTheme();
  const navigate = useNavigate();
  
  // Use centralized user data context instead of local state
  const { 
    isAuthenticated, 
    weddingData, 
    saveWeddingData, 
    userInfo, 
    logout: contextLogout,
    isLoading: contextLoading 
  } = useUserData();
  
  // Get theme from themes object
  const theme = themes[currentTheme];
  
  // Dashboard-specific state
  const [activeSection, setActiveSection] = useState('edit');
  const [activeForm, setActiveForm] = useState(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState(true);
  // Removed previewMode state - no longer needed
  const [currentPreviewPage, setCurrentPreviewPage] = useState('home');
  const [weddingUrl, setWeddingUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    // Check authentication using centralized context
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Generate wedding URL when wedding data is loaded
    if (weddingData && weddingData.shareable_id) {
      generateWeddingUrl(weddingData);
    }
  }, [isAuthenticated, weddingData, navigate]);

  const generateWeddingUrl = (weddingData) => {
    // Always prioritize shareable_id for the shareable URL
    const shareableId = weddingData?.shareable_id;
    if (shareableId) {
      // Generate shareable URL using /share/ route with shareable_id
      setWeddingUrl(`${window.location.origin}/share/${shareableId}`);
    } else if (weddingData?.id) {
      // Fallback to wedding_id if no shareable_id
      setWeddingUrl(`${window.location.origin}/wedding/${weddingData.id}`);
    }
  };

  const handleFormSubmit = async (sectionId, formData) => {
    try {
      // Handle form submission and update wedding data
      let updatedData = { ...weddingData, ...formData };
      
      // Use centralized save function with error handling
      await saveWeddingData(updatedData);
      setActiveForm(null);
    } catch (error) {
      console.error('Error saving form data:', error);
      // Don't close the form if save fails - let user try again
      alert('Failed to save data. Please check your connection and try again.');
    }
  };

  const handleDataChange = async (field, value) => {
    const updatedData = {
      ...weddingData,
      [field]: value
    };
    
    // Special handling for wedding party data
    if (field === 'bridal_party' || field === 'groom_party' || field === 'special_roles') {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) return;
        
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        const response = await fetch(`${backendUrl}/api/wedding/party`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            [field]: value
          })
        });
        
        const data = await response.json();
        if (data.success) {
          // Update the wedding data in context with the returned data
          saveWeddingData(data.wedding_data);
        } else {
          console.error('Failed to update wedding party:', data);
        }
      } catch (error) {
        console.error('Error updating wedding party:', error);
      }
    } else {
      // Use centralized save function for other fields
      saveWeddingData(updatedData);
    }
  };

  const handleLogout = () => {
    contextLogout();
    navigate('/');
  };

  const copyToClipboard = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(weddingUrl);
      } else {
        // Fallback method: Create temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = weddingUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!result) {
          throw new Error('execCommand copy failed');
        }
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Show user a manual copy option
      const userPrompt = prompt('Copy this URL manually:', weddingUrl);
      if (userPrompt !== null) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const editSections = [
    { id: 'home', label: 'Home', icon: Heart, description: 'Edit couple names, date, venue' },
    { id: 'story', label: 'Our Story', icon: Heart, description: 'Timeline and love story' },
    { id: 'rsvp', label: 'RSVP Admin', icon: Mail, description: 'Manage RSVP responses' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Wedding day timeline' },
    { id: 'gallery', label: 'Gallery', icon: Image, description: 'Photo gallery' },
    { id: 'party', label: 'Wedding Party', icon: Users, description: 'Bridal and groom party' },
    { id: 'registry', label: 'Registry', icon: LinkIcon, description: 'Gift registry links' },
    { id: 'guestbook', label: 'Guestbook', icon: MessageCircle, description: 'Guest messages' },
    { id: 'faq', label: 'FAQ', icon: Settings, description: 'Frequently asked questions' },
    { id: 'theme', label: 'Theme', icon: Settings, description: 'Classic, Modern, or Boho' }
  ];

  const sidebarSections = [
    { id: 'edit', label: 'Edit the Info', icon: Edit3 },
    { id: 'qr', label: 'Get QR Code', icon: QrCode },
    { id: 'url', label: 'Get Shareable Link', icon: LinkIcon },
    { id: 'email', label: 'Mail the Invitation', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Invitation', icon: MessageCircle },
  ];

  // Mini Desktop Preview Component - Scaled down version of actual homepage
  const MiniDesktopPreview = () => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    // Wedding date calculation
    const weddingDate = new Date(weddingData.wedding_date + 'T15:00:00');

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate.getTime() - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [weddingDate]);

    return (
      <div className="w-full h-full" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '167%' }}>
        {/* Mini Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 transition-all duration-500 bg-white/80 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8" style={{ color: theme.accent }} />
              <span className="text-2xl font-light" style={{ fontFamily: theme.fontPrimary, color: theme.primary }}>
                {weddingData.couple_name_1} & {weddingData.couple_name_2}
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Home</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Our Story</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>RSVP</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Schedule</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Gallery</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Wedding Party</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Registry</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Guestbook</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>FAQ</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-sm"
                style={{ color: theme.text }}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="boho">Boho</option>
              </select>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen text-center overflow-hidden pt-16 md:pt-0">
          {/* Background Image */}
          <div 
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1920&h=1080&fit=crop)',
              zIndex: -2
            }}
          />
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(248, 246, 240, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              zIndex: -1
            }}
          />

          <div className="relative z-10 max-w-4xl px-8 mx-auto mt-8 md:mt-48">
            {/* Names */}
            <h1 
              className="text-6xl md:text-8xl font-light tracking-wider mb-8"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              {weddingData.couple_name_1} & {weddingData.couple_name_2}
            </h1>

            {/* Separator */}
            <div 
              className="w-24 h-0.5 mx-auto mb-8"
              style={{ background: theme.accent }}
            />

            {/* Wedding Date */}
            <h2 
              className="text-2xl md:text-3xl font-normal tracking-widest mb-4"
              style={{ 
                fontFamily: theme.fontSecondary,
                color: theme.text
              }}
            >
              {new Date(weddingData.wedding_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>

            {/* Venue */}
            <p 
              className="text-lg md:text-xl font-light tracking-wide mb-12"
              style={{ color: theme.textLight }}
            >
              {weddingData.venue_location}
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-lg mx-auto">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="text-center p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30"
                  >
                    <span 
                      className="block text-3xl md:text-4xl font-semibold mb-2"
                      style={{ color: theme.accent }}
                    >
                      {item.value}
                    </span>
                    <span 
                      className="text-sm uppercase tracking-wider opacity-80"
                      style={{ color: theme.text }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider"
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary,
                  boxShadow: `0 10px 30px ${theme.accent}30`
                }}
              >
                <Heart className="w-5 h-5" />
                RSVP Now
              </button>
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider border-2"
                style={{
                  borderColor: theme.accent,
                  color: theme.text,
                  background: 'transparent'
                }}
              >
                <Calendar className="w-5 h-5" />
                Event Details
              </button>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section 
          className="py-24 px-8"
          style={{ background: theme.gradientPrimary }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 
              className="text-5xl font-light mb-8"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Join Us for Our Special Day
            </h2>

            <p 
              className="text-xl leading-relaxed max-w-3xl mx-auto mb-16"
              style={{ color: theme.textLight }}
            >
              {weddingData.their_story}
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: 'Save the Date',
                  text: `Mark your calendars for ${new Date(weddingData.wedding_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}. Ceremony begins at 3:00 PM, followed by cocktails and dinner reception.`
                },
                {
                  icon: MapPin,
                  title: 'Beautiful Venue',
                  text: `${weddingData.venue_name} provides the perfect romantic backdrop for our celebration.`
                },
                {
                  icon: Heart,
                  title: 'Love & Joy',
                  text: 'Come celebrate love, laughter, and the beginning of our forever. Your presence will make our day complete.'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                  >
                    <div 
                      className="text-5xl mb-6"
                      style={{ color: theme.accent }}
                    >
                      <Icon className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 
                      className="text-2xl font-semibold mb-4"
                      style={{ 
                        fontFamily: theme.fontPrimary,
                        color: theme.primary 
                      }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ color: theme.textLight }}
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: theme.background,
        fontFamily: theme.fontSecondary
      }}
    >
      {/* Include Navigation component for dashboard - same as landing page */}
      <FloatingNavbar 
        weddingData={weddingData} 
        isPublicPage={true}
        activeSection={currentPreviewPage}
        setActiveSection={setCurrentPreviewPage}
      />

      {/* Dashboard Controls - Floating top-right */}
      {weddingUrl && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white/95 transition-all duration-300 shadow-lg backdrop-blur-sm"
            style={{ color: theme.text, border: `1px solid ${theme.accent}30` }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>
      )}

      {/* Live Wedding Invitation View - Full Dashboard View with Navigation */}
      <div className="w-full min-h-screen">
        {/* Render actual wedding page component based on current preview page - FULL SIZE with navigation */}
        {currentPreviewPage === 'home' && <HomePage />}
        {currentPreviewPage === 'story' && <StoryPage />}
        {currentPreviewPage === 'schedule' && <SchedulePage />}
        {currentPreviewPage === 'gallery' && <GalleryPage />}
        {currentPreviewPage === 'party' && <PartyPage />}
        {currentPreviewPage === 'rsvp' && <RSVPPage />}
        {currentPreviewPage === 'registry' && <RegistryPage />}
        {currentPreviewPage === 'faq' && <FAQPage />}
        {currentPreviewPage === 'guestbook' && <GuestbookPage isPrivate={false} isDashboard={true} />}
      </div>

      {/* Form Popups */}
      {activeForm && (
        <FormPopup
          sectionId={activeForm}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
          initialData={weddingData}
          theme={theme}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
        />
      )}
    </div>
  );
};

// Form Popup Component
const FormPopup = ({ sectionId, onClose, onSubmit, initialData, theme, currentTheme, setCurrentTheme }) => {
  const [formData, setFormData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(formData).length > 0) {
      onSubmit(sectionId, formData);
      setHasUnsavedChanges(false);
    }
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
    // Remove aggressive auto-save - only save when user explicitly saves
  };

  // Handle clicking outside the form to save and close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      // Ask user if they want to save changes before closing
      if (hasUnsavedChanges && Object.keys(formData).length > 0) {
        const shouldSave = window.confirm('You have unsaved changes. Do you want to save them before closing?');
        if (shouldSave) {
          onSubmit(sectionId, formData);
        }
      }
      onClose();
    }
  };

  // Handle form close without saving
  const handleCloseWithoutSaving = () => {
    setFormData({});
    setHasUnsavedChanges(false);
    onClose();
  };

  const renderForm = () => {
    switch (sectionId) {
      case 'home':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit Home Section
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Bride's Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.couple_name_1}
                  onChange={(e) => handleChange('couple_name_1', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Groom's Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.couple_name_2}
                  onChange={(e) => handleChange('couple_name_2', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Wedding Date
                </label>
                <input
                  type="date"
                  defaultValue={initialData.wedding_date}
                  onChange={(e) => handleChange('wedding_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.venue_name}
                  onChange={(e) => handleChange('venue_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Venue Location
              </label>
              <input
                type="text"
                defaultValue={initialData.venue_location}
                onChange={(e) => handleChange('venue_location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                style={{ color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Love Story Description
              </label>
              <textarea
                rows={4}
                defaultValue={initialData.their_story}
                onChange={(e) => handleChange('their_story', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 resize-none"
                style={{ color: theme.text }}
              />
            </div>
          </div>
        );
      
      case 'story':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit Our Story Section
            </h3>
            <OurStoryFormContent 
              initialData={initialData} 
              theme={theme} 
              onSave={handleChange} 
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit Schedule Section
            </h3>
            <ScheduleFormContent 
              initialData={initialData} 
              theme={theme} 
              onSave={handleChange} 
            />
          </div>
        );

      case 'rsvp':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              RSVP Management
            </h3>
            <RSVPAdminContent 
              weddingData={initialData} 
              theme={theme} 
            />
          </div>
        );

      case 'theme':
        return (
          <ThemeSelector 
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            theme={theme}
            onSave={handleChange}
            onClose={onClose}
          />
        );

      case 'party':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Wedding Party Management
            </h3>
            <WeddingPartyFormContent 
              initialData={initialData} 
              theme={theme} 
              onSave={handleChange} 
            />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              FAQ Management
            </h3>
            <FAQAdminContent 
              initialData={initialData} 
              theme={theme} 
              onSave={handleChange} 
            />
          </div>
        );

      case 'registry':
        return (
          <div className="space-y-6">
            <RegistryAdminContent 
              initialData={initialData} 
              theme={theme} 
              onSave={handleChange} 
            />
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-6">
            <QRCodeGenerator 
              weddingData={initialData}
              theme={theme}
              onClose={onClose}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section
            </h3>
            <p style={{ color: theme.textLight }}>
              Form for {sectionId} section coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ border: `1px solid ${theme.accent}30` }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 transition-colors duration-200"
              style={{ color: theme.textLight }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {renderForm()}
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={handleCloseWithoutSaving}
                className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                style={{ color: theme.text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasUnsavedChanges}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  !hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Our Story Form Content Component
const OurStoryFormContent = ({ initialData, theme, onSave }) => {
  const [storyTimeline, setStoryTimeline] = useState(
    initialData.story_timeline || []
  );
  const [storyEnabled, setStoryEnabled] = useState(
    initialData.story_enabled !== false // Default to enabled if not set
  );
  const [hasChanges, setHasChanges] = useState(false);
  
  // Local form state to prevent re-renders during typing
  // This tracks form inputs for each timeline item to prevent focus loss
  const [formInputs, setFormInputs] = useState({});

  // Theme colors for different timeline sections
  const timelineColors = [
    { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' }, // Blue
    { bg: '#F3E5F5', border: '#9C27B0', text: '#7B1FA2' }, // Purple  
    { bg: '#E8F5E8', border: '#4CAF50', text: '#388E3C' }, // Green
    { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' }, // Orange
    { bg: '#FCE4EC', border: '#E91E63', text: '#C2185B' }, // Pink
  ];

  const addTimelineItem = () => {
    const newItem = {
      year: new Date().getFullYear().toString(),
      title: "New Milestone",
      description: "Tell your story here...",
      image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=600&h=400&fit=crop"
    };
    const newTimeline = [...storyTimeline, newItem];
    setStoryTimeline(newTimeline);
    
    // Initialize form inputs for the new item to prevent focus loss
    const newIndex = newTimeline.length - 1;
    setFormInputs(prev => ({
      ...prev,
      [`${newIndex}_year`]: newItem.year,
      [`${newIndex}_title`]: newItem.title,
      [`${newIndex}_description`]: newItem.description,
      [`${newIndex}_image`]: newItem.image
    }));
    
    setHasChanges(true);
  };

  const removeTimelineItem = (index) => {
    const updatedTimeline = storyTimeline.filter((_, i) => i !== index);
    setStoryTimeline(updatedTimeline);
    setHasChanges(true);
  };

  // Update local form state without triggering re-renders
  const updateFormInput = (index, field, value) => {
    setFormInputs(prev => ({
      ...prev,
      [`${index}_${field}`]: value
    }));
    setHasChanges(true);
    // No immediate timeline update to prevent focus loss
  };

  // Get value from form inputs or fallback to timeline data
  const getFieldValue = (index, field) => {
    const key = `${index}_${field}`;
    return formInputs[key] !== undefined ? formInputs[key] : storyTimeline[index]?.[field] || '';
  };

  const updateTimelineItem = (index, field, value) => {
    const updatedTimeline = storyTimeline.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setStoryTimeline(updatedTimeline);
    setHasChanges(true);
    // Remove auto-save to prevent focus loss - only save on explicit save action
  };

  const handleSave = () => {
    // Apply all form inputs to the timeline before saving
    let updatedTimeline = [...storyTimeline];
    
    Object.keys(formInputs).forEach(key => {
      const [indexStr, field] = key.split('_');
      const index = parseInt(indexStr);
      const value = formInputs[key];
      
      if (updatedTimeline[index]) {
        updatedTimeline[index] = {
          ...updatedTimeline[index],
          [field]: value
        };
      }
    });
    
    // Update timeline state and save
    setStoryTimeline(updatedTimeline);
    onSave('story_timeline', updatedTimeline);
    onSave('story_enabled', storyEnabled);
    setHasChanges(false);
    
    // Clear form inputs after successful save
    setFormInputs({});
  };

  // Remove aggressive auto-save that causes focus loss
  const handleFormBlur = () => {
    // Removed auto-save on blur to prevent focus loss and form closing issues
    // User must explicitly save using the Save button
  };

  const handleToggleEnabled = (enabled) => {
    setStoryEnabled(enabled);
    setHasChanges(true);
  };

  return (
    <div 
      className="space-y-6 max-h-[70vh] overflow-y-auto"
      onBlur={handleFormBlur}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          Edit Our Story Section
        </h3>
        
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            Section Enabled:
          </span>
          <button
            onClick={() => handleToggleEnabled(!storyEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
              storyEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform duration-200 bg-white rounded-full ${
                storyEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {storyEnabled && (
        <>
          <div className="mb-6">
            <p className="text-sm" style={{ color: theme.textLight }}>
              Create your love story timeline with meaningful milestones. Each section has a unique color theme for easy identification.
            </p>
          </div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {storyTimeline.map((item, index) => {
              const colorTheme = timelineColors[index % timelineColors.length];
              
              return (
                <div key={index} className="relative">
                  {/* Section Header with Clear Numbering */}
                  <div 
                    className="flex items-center justify-between mb-0 px-6 py-4 rounded-t-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${colorTheme.border}25, ${colorTheme.border}15)`,
                      borderLeft: `5px solid ${colorTheme.border}`
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{ backgroundColor: colorTheme.border }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl" style={{ color: colorTheme.text }}>
                          Timeline Section #{index + 1}
                        </h4>
                        <p className="text-sm opacity-75" style={{ color: colorTheme.text }}>
                          Complete timeline milestone section
                        </p>
                      </div>
                    </div>
                    
                    {/* Delete Button - More Prominent */}
                    <button
                      onClick={() => removeTimelineItem(index)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      title="Delete this entire timeline section"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete Section</span>
                    </button>
                  </div>

                  {/* Main Content Container */}
                  <div
                    className="relative p-8 rounded-b-2xl border-4 shadow-xl transition-all duration-300 hover:shadow-2xl"
                    style={{
                      backgroundColor: colorTheme.bg,
                      borderColor: colorTheme.border,
                      borderTop: 'none'
                    }}
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Year */}
                      <div>
                        <label className="block text-sm font-bold mb-3" style={{ color: colorTheme.text }}>
                          Year
                        </label>
                        <input
                          type="text"
                          value={getFieldValue(index, 'year')}
                          onChange={(e) => updateFormInput(index, 'year', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none"
                          style={{
                            borderColor: colorTheme.border,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: colorTheme.text
                          }}
                          placeholder="e.g., 2019"
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-bold mb-3" style={{ color: colorTheme.text }}>
                          Title
                        </label>
                        <input
                          type="text"
                          value={getFieldValue(index, 'title')}
                          onChange={(e) => updateFormInput(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none"
                          style={{
                            borderColor: colorTheme.border,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: colorTheme.text
                          }}
                          placeholder="e.g., First Meeting"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                      <label className="block text-sm font-bold mb-3" style={{ color: colorTheme.text }}>
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={getFieldValue(index, 'description')}
                        onChange={(e) => updateFormInput(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none resize-none"
                        style={{
                          borderColor: colorTheme.border,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: colorTheme.text
                        }}
                        placeholder="Tell your story for this milestone..."
                      />
                    </div>

                    {/* Image URL */}
                    <div className="mt-6">
                      <label className="block text-sm font-bold mb-3" style={{ color: colorTheme.text }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={getFieldValue(index, 'image')}
                        onChange={(e) => updateFormInput(index, 'image', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none"
                        style={{
                          borderColor: colorTheme.border,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: colorTheme.text
                        }}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    {/* Image Preview */}
                    {item.image && (
                      <div className="mt-4">
                        <img
                          src={item.image}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-xl border-4 shadow-lg"
                          style={{ borderColor: colorTheme.border }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Timeline Item */}
          <button
            onClick={addTimelineItem}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 hover:bg-white/10"
            style={{ borderColor: theme.accent, color: theme.accent }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Timeline Milestone</span>
          </button>
        </>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-6 border-t border-white/20">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme.gradientAccent,
              color: theme.primary
            }}
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Schedule Form Content Component
const ScheduleFormContent = ({ initialData, theme, onSave }) => {
  const [scheduleEvents, setScheduleEvents] = useState(
    initialData.schedule_events || []
  );
  const [importantInfo, setImportantInfo] = useState(
    initialData.important_info || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Local form state to prevent re-renders during typing
  const [eventFormInputs, setEventFormInputs] = useState({});
  const [infoFormInputs, setInfoFormInputs] = useState({});

  const iconOptions = [
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'Users', icon: Users },
    { name: 'Music', icon: Music },
    { name: 'Camera', icon: Camera },
    { name: 'Utensils', icon: Utensils },
    { name: 'MapPin', icon: MapPin }
  ];

  // Add new event
  const addEvent = () => {
    const newEvent = {
      time: "12:00 PM",
      title: "New Event",
      description: "Event description here...",
      location: "Event Location",
      duration: "1 hour",
      highlight: false
    };
    const newEvents = [...scheduleEvents, newEvent];
    setScheduleEvents(newEvents);
    
    // Initialize form inputs for the new item
    const newIndex = newEvents.length - 1;
    setEventFormInputs(prev => ({
      ...prev,
      [`${newIndex}_time`]: newEvent.time,
      [`${newIndex}_title`]: newEvent.title,
      [`${newIndex}_description`]: newEvent.description,
      [`${newIndex}_location`]: newEvent.location,
      [`${newIndex}_duration`]: newEvent.duration,
      [`${newIndex}_highlight`]: newEvent.highlight
    }));
    
    setEditingIndex(newIndex);
    setHasChanges(true);
  };

  // Remove event
  const removeEvent = (index) => {
    const updatedEvents = scheduleEvents.filter((_, i) => i !== index);
    setScheduleEvents(updatedEvents);
    if (editingIndex === index) setEditingIndex(null);
    setHasChanges(true);
  };

  // Update local form state for events without triggering re-renders
  const updateEventFormInput = (index, field, value) => {
    setEventFormInputs(prev => ({
      ...prev,
      [`${index}_${field}`]: value
    }));
    setHasChanges(true);
  };

  // Get value from form inputs or fallback to event data
  const getEventFieldValue = (index, field) => {
    const key = `${index}_${field}`;
    return eventFormInputs[key] !== undefined ? eventFormInputs[key] : scheduleEvents[index]?.[field] || '';
  };

  // Add new important info
  const addImportantInfo = () => {
    const newInfo = {
      title: "New Information",
      description: "Add details here..."
    };
    const newInfos = [...importantInfo, newInfo];
    setImportantInfo(newInfos);
    
    // Initialize form inputs for the new item
    const newIndex = newInfos.length - 1;
    setInfoFormInputs(prev => ({
      ...prev,
      [`${newIndex}_title`]: newInfo.title,
      [`${newIndex}_description`]: newInfo.description
    }));
    
    setHasChanges(true);
  };

  // Remove important info
  const removeImportantInfo = (index) => {
    const updatedInfo = importantInfo.filter((_, i) => i !== index);
    setImportantInfo(updatedInfo);
    setHasChanges(true);
  };

  // Update local form state for important info
  const updateInfoFormInput = (index, field, value) => {
    setInfoFormInputs(prev => ({
      ...prev,
      [`${index}_${field}`]: value
    }));
    setHasChanges(true);
  };

  // Get value from form inputs or fallback to info data
  const getInfoFieldValue = (index, field) => {
    const key = `${index}_${field}`;
    return infoFormInputs[key] !== undefined ? infoFormInputs[key] : importantInfo[index]?.[field] || '';
  };

  const handleSave = () => {
    // Apply all form inputs to the events before saving
    let updatedEvents = [...scheduleEvents];
    
    Object.keys(eventFormInputs).forEach(key => {
      const [indexStr, field] = key.split('_');
      const index = parseInt(indexStr);
      const value = eventFormInputs[key];
      
      if (updatedEvents[index]) {
        updatedEvents[index] = {
          ...updatedEvents[index],
          [field]: value
        };
      }
    });
    
    // Apply all form inputs to the important info before saving
    let updatedInfo = [...importantInfo];
    
    Object.keys(infoFormInputs).forEach(key => {
      const [indexStr, field] = key.split('_');
      const index = parseInt(indexStr);
      const value = infoFormInputs[key];
      
      if (updatedInfo[index]) {
        updatedInfo[index] = {
          ...updatedInfo[index],
          [field]: value
        };
      }
    });
    
    // Update state and save
    setScheduleEvents(updatedEvents);
    setImportantInfo(updatedInfo);
    onSave('schedule_events', updatedEvents);
    onSave('important_info', updatedInfo);
    setHasChanges(false);
    setEditingIndex(null);
    
    // Clear form inputs after successful save
    setEventFormInputs({});
    setInfoFormInputs({});
  };

  return (
    <div className="space-y-8">
      {/* Schedule Events Section */}
      <div>
        <h4 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
          Wedding Timeline
        </h4>
        
        <div className="space-y-4">
          {scheduleEvents.map((event, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5" style={{ color: theme.accent }} />
                  <span className="font-medium" style={{ color: theme.text }}>
                    Event {index + 1}
                    {event.highlight && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ background: theme.accent + '30', color: theme.accent }}>
                        Highlighted
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: theme.accent }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeEvent(index)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingIndex === index ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Time
                      </label>
                      <input
                        type="text"
                        value={getEventFieldValue(index, 'time')}
                        onChange={(e) => updateEventFormInput(index, 'time', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30"
                        style={{ color: theme.text }}
                        placeholder="2:00 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Duration
                      </label>
                      <input
                        type="text"
                        value={getEventFieldValue(index, 'duration')}
                        onChange={(e) => updateEventFormInput(index, 'duration', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30"
                        style={{ color: theme.text }}
                        placeholder="1 hour"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={getEventFieldValue(index, 'title')}
                      onChange={(e) => updateEventFormInput(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30"
                      style={{ color: theme.text }}
                      placeholder="Wedding Ceremony"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={getEventFieldValue(index, 'location')}
                      onChange={(e) => updateEventFormInput(index, 'location', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30"
                      style={{ color: theme.text }}
                      placeholder="Garden Estate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={getEventFieldValue(index, 'description')}
                      onChange={(e) => updateEventFormInput(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 resize-none"
                      style={{ color: theme.text }}
                      placeholder="Event description..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`highlight-${index}`}
                      checked={getEventFieldValue(index, 'highlight')}
                      onChange={(e) => updateEventFormInput(index, 'highlight', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor={`highlight-${index}`} className="text-sm font-medium" style={{ color: theme.text }}>
                      Highlight this event (make it stand out in the timeline)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-lg" style={{ color: theme.primary }}>
                    {event.title}
                  </p>
                  <p className="text-sm" style={{ color: theme.textLight }}>
                    {event.time} • {event.duration}
                  </p>
                  <p style={{ color: theme.text }}>{event.description}</p>
                  <p className="text-sm flex items-center space-x-2" style={{ color: theme.textLight }}>
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addEvent}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 hover:bg-white/10"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Event</span>
        </button>
      </div>

      {/* Important Information Section */}
      <div>
        <h4 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
          Important Information
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          {importantInfo.map((info, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-medium" style={{ color: theme.text }}>Info {index + 1}</span>
                <button
                  onClick={() => removeImportantInfo(index)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={getInfoFieldValue(index, 'title')}
                    onChange={(e) => updateInfoFormInput(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30"
                    style={{ color: theme.text }}
                    placeholder="Dress Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={getInfoFieldValue(index, 'description')}
                    onChange={(e) => updateInfoFormInput(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 resize-none"
                    style={{ color: theme.text }}
                    placeholder="Details..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addImportantInfo}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 hover:bg-white/10"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Custom Information</span>
        </button>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-6 border-t border-white/20">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme.gradientAccent,
              color: theme.primary
            }}
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

// RSVP Admin Content Component - Enhanced with Two Sections
const RSVPAdminContent = ({ weddingData, theme }) => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('attending'); // 'attending' or 'declining'
  const [expandedCard, setExpandedCard] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    notAttending: 0,
    totalGuests: 0
  });

  useEffect(() => {
    fetchRSVPs();
  }, [weddingData]);

  const fetchRSVPs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const weddingId = weddingData?.shareable_id || weddingData?.id;
      
      if (!weddingId) {
        setError('Wedding ID not found');
        return;
      }
      
      const response = await fetch(`${backendUrl}/api/rsvp/shareable/${weddingId}`);
      const data = await response.json();
      
      if (data.success) {
        setRsvps(data.rsvps);
        
        // Calculate statistics
        const attending = data.rsvps.filter(rsvp => rsvp.attendance === 'yes');
        const notAttending = data.rsvps.filter(rsvp => rsvp.attendance === 'no');
        const totalGuests = attending.reduce((sum, rsvp) => sum + (rsvp.guest_count || 1), 0);
        
        setStats({
          total: data.rsvps.length,
          attending: attending.length,
          notAttending: notAttending.length,
          totalGuests: totalGuests
        });
      } else {
        setError(data.message || 'Failed to fetch RSVPs');
      }
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
      setError('Failed to load RSVP data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const attendingRsvps = rsvps.filter(rsvp => rsvp.attendance === 'yes');
  const decliningRsvps = rsvps.filter(rsvp => rsvp.attendance === 'no');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full" style={{ color: theme.accent }}></div>
        <span className="ml-3 text-lg" style={{ color: theme.text }}>Loading RSVPs...</span>
      </div>
    );
  }

  const RSVPCard = ({ rsvp, isExpanded, onToggle, cardType }) => (
    <div 
      className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
        cardType === 'attending' 
          ? 'bg-green-50 border-green-200 hover:border-green-300' 
          : 'bg-red-50 border-red-200 hover:border-red-300'
      }`}
      onClick={() => onToggle(rsvp.id)}
    >
      {/* Main Card Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              cardType === 'attending' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h5 className="text-lg font-semibold" style={{ color: theme.primary }}>
              {rsvp.guest_name}
            </h5>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: theme.textLight }} />
            <span className="text-sm font-medium" style={{ color: theme.text }}>
              {rsvp.guest_count || 1} guest{(rsvp.guest_count || 1) > 1 ? 's' : ''}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: theme.accent }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/30 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: theme.accent }} />
              <span style={{ color: theme.text }}>{rsvp.guest_email || 'No email provided'}</span>
            </div>
            {rsvp.guest_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: theme.accent }} />
                <span style={{ color: theme.text }}>{rsvp.guest_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: theme.accent }} />
              <span style={{ color: theme.text }}>{formatDate(rsvp.submitted_at)}</span>
            </div>
          </div>

          {rsvp.dietary_restrictions && (
            <div className="p-3 rounded-lg bg-orange-100 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Dietary Restrictions:</span>
              </div>
              <p className="text-sm text-orange-700">{rsvp.dietary_restrictions}</p>
            </div>
          )}

          {rsvp.special_message && (
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Special Message:</span>
              </div>
              <p className="text-sm text-blue-700">{rsvp.special_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
          <X className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
          <button 
            onClick={fetchRSVPs}
            className="ml-auto px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          RSVP Admin Dashboard
        </h3>
        <button
          onClick={fetchRSVPs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          style={{ color: theme.text }}
        >
          <Calendar className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* RSVP Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total RSVPs', value: stats.total, icon: Mail, color: theme.accent },
          { label: 'Joyfully Accepts', value: stats.attending, icon: CheckCircle, color: '#10B981' },
          { label: 'Regretfully Declines', value: stats.notAttending, icon: X, color: '#EF4444' },
          { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: theme.primary }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center"
            >
              <Icon 
                className="w-8 h-8 mx-auto mb-3" 
                style={{ color: stat.color }}
              />
              <div className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
                {stat.value}
              </div>
              <div className="text-sm opacity-70" style={{ color: theme.textLight }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Section Toggle */}
      <div className="flex bg-white/10 rounded-2xl p-2">
        <button
          onClick={() => setActiveSection('attending')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeSection === 'attending' ? 'shadow-md' : ''
          }`}
          style={{
            background: activeSection === 'attending' ? '#10B981' : 'transparent',
            color: activeSection === 'attending' ? 'white' : theme.text
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Joyfully Accepts ({stats.attending})</span>
        </button>
        <button
          onClick={() => setActiveSection('declining')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeSection === 'declining' ? 'shadow-md' : ''
          }`}
          style={{
            background: activeSection === 'declining' ? '#EF4444' : 'transparent',
            color: activeSection === 'declining' ? 'white' : theme.text
          }}
        >
          <X className="w-5 h-5" />
          <span className="font-semibold">Regretfully Declines ({stats.notAttending})</span>
        </button>
      </div>

      {/* RSVP Cards Display */}
      <div className="space-y-4">
        {activeSection === 'attending' && (
          <div className="space-y-4">
            {attendingRsvps.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.textLight }} />
                <p className="text-lg mb-2" style={{ color: theme.text }}>No Attending Guests Yet</p>
                <p className="text-sm opacity-70" style={{ color: theme.textLight }}>
                  Guests who accept the invitation will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendingRsvps.map((rsvp) => (
                  <RSVPCard
                    key={rsvp.id}
                    rsvp={rsvp}
                    isExpanded={expandedCard === rsvp.id}
                    onToggle={toggleCard}
                    cardType="attending"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'declining' && (
          <div className="space-y-4">
            {decliningRsvps.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <X className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.textLight }} />
                <p className="text-lg mb-2" style={{ color: theme.text }}>No Declining Guests Yet</p>
                <p className="text-sm opacity-70" style={{ color: theme.textLight }}>
                  Guests who decline the invitation will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {decliningRsvps.map((rsvp) => (
                  <RSVPCard
                    key={rsvp.id}
                    rsvp={rsvp}
                    isExpanded={expandedCard === rsvp.id}
                    onToggle={toggleCard}
                    cardType="declining"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wedding Party Form Content Component
const WeddingPartyFormContent = ({ initialData, theme, onSave }) => {
  const [bridalParty, setBridalParty] = useState(
    initialData.bridal_party || []
  );
  const [groomParty, setGroomParty] = useState(
    initialData.groom_party || []
  );
  const [specialRoles, setSpecialRoles] = useState(
    initialData.special_roles || []
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Add new party member
  const addPartyMember = (partyType) => {
    const newMember = {
      id: Date.now().toString(), // Simple ID generation
      name: "",
      role: "",
      relationship: "",
      description: "",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b734?w=400&h=400&fit=crop&crop=face"
    };

    if (partyType === 'bridal') {
      setBridalParty([...bridalParty, newMember]);
    } else if (partyType === 'groom') {
      setGroomParty([...groomParty, newMember]);
    } else if (partyType === 'special') {
      setSpecialRoles([...specialRoles, { ...newMember, age: "" }]);
    }
    setHasChanges(true);
  };

  // Remove party member
  const removePartyMember = (partyType, index) => {
    if (partyType === 'bridal') {
      const updated = bridalParty.filter((_, i) => i !== index);
      setBridalParty(updated);
    } else if (partyType === 'groom') {
      const updated = groomParty.filter((_, i) => i !== index);
      setGroomParty(updated);
    } else if (partyType === 'special') {
      const updated = specialRoles.filter((_, i) => i !== index);
      setSpecialRoles(updated);
    }
    setHasChanges(true);
  };

  // Update party member
  const updatePartyMember = (partyType, index, field, value) => {
    if (partyType === 'bridal') {
      const updated = bridalParty.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      );
      setBridalParty(updated);
    } else if (partyType === 'groom') {
      const updated = groomParty.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      );
      setGroomParty(updated);
    } else if (partyType === 'special') {
      const updated = specialRoles.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      );
      setSpecialRoles(updated);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    // Update all party data
    onSave('bridal_party', bridalParty);
    onSave('groom_party', groomParty);
    onSave('special_roles', specialRoles);
    setHasChanges(false);
  };

  const PartyMemberForm = ({ member, index, partyType, isSpecial = false }) => (
    <div className="p-6 rounded-2xl border-2 bg-white/10" style={{ borderColor: theme.accent + '40' }}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
          {partyType === 'bridal' ? 'Bride\'s Party' : partyType === 'groom' ? 'Groom\'s Party' : 'Special Role'} Member #{index + 1}
        </h4>
        <button
          onClick={() => removePartyMember(partyType, index)}
          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
          style={{ color: '#EF4444' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Name *
          </label>
          <input
            type="text"
            value={member.name}
            onChange={(e) => updatePartyMember(partyType, index, 'name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
            style={{ color: theme.text }}
            placeholder="Full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Role *
          </label>
          <input
            type="text"
            value={member.role}
            onChange={(e) => updatePartyMember(partyType, index, 'role', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
            style={{ color: theme.text }}
            placeholder="e.g., Maid of Honor, Best Man, Flower Girl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Relationship *
          </label>
          <input
            type="text"
            value={member.relationship}
            onChange={(e) => updatePartyMember(partyType, index, 'relationship', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
            style={{ color: theme.text }}
            placeholder="e.g., Sister, Best Friend, College Roommate"
          />
        </div>

        {isSpecial && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Age
            </label>
            <input
              type="text"
              value={member.age || ''}
              onChange={(e) => updatePartyMember(partyType, index, 'age', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
              style={{ color: theme.text }}
              placeholder="e.g., Age 6"
            />
          </div>
        )}

        <div className={isSpecial ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Photo URL (JPEG/PNG only) *
          </label>
          <input
            type="url"
            value={member.image}
            onChange={(e) => updatePartyMember(partyType, index, 'image', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
            style={{ color: theme.text }}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
          Description *
        </label>
        <textarea
          rows={3}
          value={member.description}
          onChange={(e) => updatePartyMember(partyType, index, 'description', e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 resize-none"
          style={{ color: theme.text }}
          placeholder="Write a brief description about this person and their role in your wedding..."
        />
      </div>

      {member.image && (
        <div className="mt-4">
          <img
            src={member.image}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-full border-2"
            style={{ borderColor: theme.accent }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto">
      <div className="text-center">
        <p className="text-sm" style={{ color: theme.textLight }}>
          Manage your wedding party members. Add photos, names, roles, and descriptions for each person who will be part of your special day.
        </p>
      </div>

      {/* Bride's Party */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-3" style={{ color: theme.primary }}>
            <Heart className="w-6 h-6" style={{ color: theme.accent }} />
            Bride's Party ({bridalParty.length})
          </h3>
          <button
            onClick={() => addPartyMember('bridal')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: theme.gradientAccent, color: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        
        <div className="space-y-4">
          {bridalParty.map((member, index) => (
            <PartyMemberForm 
              key={member.id || index} 
              member={member} 
              index={index} 
              partyType="bridal" 
            />
          ))}
          
          {bridalParty.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.accent + '40' }}>
              <p style={{ color: theme.textLight }}>No bride's party members added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Groom's Party */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-3" style={{ color: theme.primary }}>
            <Users className="w-6 h-6" style={{ color: theme.accent }} />
            Groom's Party ({groomParty.length})
          </h3>
          <button
            onClick={() => addPartyMember('groom')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: theme.gradientAccent, color: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        
        <div className="space-y-4">
          {groomParty.map((member, index) => (
            <PartyMemberForm 
              key={member.id || index} 
              member={member} 
              index={index} 
              partyType="groom" 
            />
          ))}
          
          {groomParty.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.accent + '40' }}>
              <p style={{ color: theme.textLight }}>No groom's party members added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Special Roles */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-3" style={{ color: theme.primary }}>
            <Star className="w-6 h-6" style={{ color: theme.accent }} />
            Special Roles ({specialRoles.length})
          </h3>
          <button
            onClick={() => addPartyMember('special')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ background: theme.gradientAccent, color: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        
        <div className="space-y-4">
          {specialRoles.map((member, index) => (
            <PartyMemberForm 
              key={member.id || index} 
              member={member} 
              index={index} 
              partyType="special" 
              isSpecial={true}
            />
          ))}
          
          {specialRoles.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl" style={{ borderColor: theme.accent + '40' }}>
              <p style={{ color: theme.textLight }}>No special roles added yet (e.g., Flower Girl, Ring Bearer)</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-6 border-t border-white/20">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme.gradientAccent,
              color: theme.primary
            }}
          >
            <Save className="w-4 h-4" />
            <span>Save Wedding Party</span>
          </button>
        </div>
      )}
    </div>
  );
};

// FAQ Admin Content Component
const FAQAdminContent = ({ initialData, theme, onSave }) => {
  const [faqs, setFaqs] = useState(
    initialData.faqs || [
      {
        id: Date.now().toString(),
        question: "What time should I arrive?",
        answer: "Please arrive by 2:30 PM. The ceremony will begin promptly at 3:00 PM."
      },
      {
        id: (Date.now() + 1).toString(),
        question: "What is the dress code?",
        answer: "We've requested cocktail attire. Ladies, consider comfortable shoes for outdoor surfaces."
      },
      {
        id: (Date.now() + 2).toString(),
        question: "Will there be parking available?",
        answer: "Yes, there is complimentary valet parking available at the venue entrance."
      }
    ]
  );
  const [expandedCard, setExpandedCard] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now().toString(),
      question: "New Question",
      answer: "Your answer here..."
    };
    setFaqs([...faqs, newFAQ]);
    setHasChanges(true);
    setExpandedCard(newFAQ.id); // Auto-expand new FAQ for editing
  };

  const removeFAQ = (faqId) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== faqId);
    setFaqs(updatedFaqs);
    setHasChanges(true);
    if (expandedCard === faqId) {
      setExpandedCard(null);
    }
  };

  const updateFAQ = (faqId, field, value) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === faqId ? { ...faq, [field]: value } : faq
    );
    setFaqs(updatedFaqs);
    setHasChanges(true);
  };

  const toggleCard = (faqId) => {
    setExpandedCard(expandedCard === faqId ? null : faqId);
  };

  const handleSave = async () => {
    // Use the FAQ update endpoint
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/wedding/faq`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          faqs: faqs
        })
      });
      
      const data = await response.json();
      if (data.success) {
        onSave('faqs', faqs);
        setHasChanges(false);
      } else {
        console.error('Failed to save FAQs:', data);
      }
    } catch (error) {
      console.error('Error saving FAQs:', error);
    }
  };

  const handleFormBlur = () => {
    if (hasChanges) {
      handleSave();
    }
  };

  return (
    <div 
      className="space-y-6 max-h-[70vh] overflow-y-auto"
      onBlur={handleFormBlur}
      tabIndex={-1}
    >
      <div className="mb-6">
        <p className="text-sm" style={{ color: theme.textLight }}>
          Manage your wedding FAQ section. Click on cards to expand and edit questions and answers. 
          These will be displayed on your public wedding page.
        </p>
      </div>

      {/* FAQ Cards */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isExpanded = expandedCard === faq.id;
          
          return (
            <div key={faq.id} className="relative">
              {/* FAQ Card */}
              <div
                className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isExpanded 
                    ? 'bg-white/20 border-opacity-50 shadow-xl' 
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
                style={{ borderColor: isExpanded ? theme.accent : 'rgba(255,255,255,0.2)' }}
                onClick={() => toggleCard(faq.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        style={{ backgroundColor: theme.accent }}
                      >
                        Q{index + 1}
                      </div>
                      <h5 className="text-lg font-semibold" style={{ color: theme.primary }}>
                        {faq.question}
                      </h5>
                    </div>
                    {!isExpanded && (
                      <p className="text-sm opacity-70 ml-11" style={{ color: theme.textLight }}>
                        {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFAQ(faq.id);
                      }}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      style={{ color: '#EF4444' }}
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      style={{ color: theme.accent }}
                    />
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isExpanded && (
                  <div className="mt-6 space-y-4 animate-in slide-in-from-top duration-200">
                    {/* Question Input */}
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none"
                        style={{
                          borderColor: theme.accent,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: theme.primary
                        }}
                        placeholder="Enter your question..."
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Answer Textarea */}
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                        Answer
                      </label>
                      <textarea
                        rows={4}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:outline-none resize-none"
                        style={{
                          borderColor: theme.accent,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: theme.primary
                        }}
                        placeholder="Provide a detailed answer..."
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New FAQ Button */}
      <button
        onClick={addFAQ}
        className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed transition-all duration-300 hover:bg-white/10"
        style={{ borderColor: theme.accent, color: theme.accent }}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add New FAQ</span>
      </button>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end pt-6 border-t border-white/20">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme.gradientAccent,
              color: theme.primary
            }}
          >
            <Save className="w-4 h-4" />
            <span>Save FAQ Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Theme Selector Component with MongoDB persistence
const ThemeSelector = ({ currentTheme, setCurrentTheme, theme, onSave, onClose }) => {
  const [saving, setSaving] = useState(false);

  const handleThemeChange = async (themeName) => {
    setSaving(true);
    
    // Immediately update the UI theme
    setCurrentTheme(themeName);
    
    try {
      // Save theme to MongoDB using the dedicated theme endpoint
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.error('No session ID found');
        return;
      }
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/wedding/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          theme: themeName
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Also update the form data for consistency
        onSave('theme', themeName);
        console.log('Theme saved to MongoDB successfully');
        
        // Auto-close after successful save
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        console.error('Failed to save theme:', data);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          Choose Your Theme
        </h3>
        {saving && (
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.accent }}>
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span>Saving...</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {[
          { 
            name: 'classic', 
            title: '🏛️ Classic',
            description: 'Elegant and timeless'
          },
          { 
            name: 'modern', 
            title: '🎨 Modern',
            description: 'Clean and contemporary'
          },
          { 
            name: 'boho', 
            title: '🌸 Boho',
            description: 'Bohemian and romantic'
          }
        ].map((themeOption) => (
          <button
            key={themeOption.name}
            onClick={() => handleThemeChange(themeOption.name)}
            disabled={saving}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 ${
              currentTheme === themeOption.name ? 'border-current shadow-lg' : 'border-transparent hover:bg-white/10'
            }`}
            style={{ 
              background: currentTheme === themeOption.name 
                ? 'rgba(212, 175, 55, 0.1)' 
                : 'rgba(255,255,255,0.05)',
              borderColor: currentTheme === themeOption.name ? theme.accent : 'rgba(255,255,255,0.1)'
            }}
          >
            <div className="text-lg font-semibold mb-2" style={{ color: theme.primary }}>
              {themeOption.title}
            </div>
            <div className="text-sm" style={{ color: theme.textLight }}>
              {themeOption.description}
            </div>
            {currentTheme === themeOption.name && (
              <div className="mt-3 flex items-center justify-center">
                <CheckCircle 
                  className="w-5 h-5" 
                  style={{ color: theme.accent }}
                />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-white/10">
        <p className="text-sm" style={{ color: theme.textLight }}>
          💡 Your theme selection will be saved automatically and applied to your entire wedding site.
        </p>
      </div>
    </div>
  );
};

export { RSVPAdminContent, ThemeSelector };
export default DashboardPage;