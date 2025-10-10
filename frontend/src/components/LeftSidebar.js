import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import { RSVPAdminContent } from '../pages/DashboardPage';
import FAQAdmin from './FAQAdmin';
import QRCodeGenerator from './QRCodeGenerator';
import ThemeManager from './ThemeManager';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Calendar, 
  Users, 
  Image, 
  Settings, 
  LogOut,
  Edit3,
  Mail,
  MessageCircle,
  Gift,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Plus,
  Save,
  MessageSquare,
  Share,
  QrCode,
  Link,
  Wand2,
  Eye,
  EyeOff,
  Download,
  Palette,
  Clock,
  MapPin,
  Phone,
  Copy,
  CheckCircle,
  X
} from 'lucide-react';

// Clipboard utility function with fallback
const copyToClipboardWithFallback = async (text) => {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (error) {
    console.warn('Clipboard API failed, using fallback method:', error);
  }

  // Fallback method: Create temporary textarea element
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
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
  } catch (fallbackError) {
    console.error('All clipboard methods failed:', fallbackError);
    // Show user a manual copy option
    const userPrompt = prompt('Copy this URL manually:', text);
    if (userPrompt !== null) {
      return; // User interaction completed
    }
    throw new Error('Failed to copy to clipboard');
  }
};

// Our Story Manager Component
const OurStoryManager = React.memo(({ weddingData, onSave, theme }) => {
  const [storyTimeline, setStoryTimeline] = useState(weddingData?.story_timeline || []);
  const [editingStage, setEditingStage] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Local form state to prevent re-renders during typing
  const [formYear, setFormYear] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // Refs for input fields to maintain focus
  const yearInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleYearChange = useCallback((e) => {
    setFormYear(e.target.value);
  }, []);

  const handleTitleChange = useCallback((e) => {
    setFormTitle(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormDescription(e.target.value);
  }, []);

  const handleImageChange = useCallback((e) => {
    setFormImage(e.target.value);
  }, []);

  const handleAddStage = () => {
    // Initialize form state for new stage
    setFormYear(new Date().getFullYear().toString());
    setFormTitle('');
    setFormDescription('');
    setFormImage('');
    setEditingStage({
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
      image: ''
    });
    setIsAddingNew(true);
  };

  const handleEditStage = (stage, index) => {
    // Initialize form state with existing stage data
    setFormYear(stage.year || '');
    setFormTitle(stage.title || '');
    setFormDescription(stage.description || '');
    setFormImage(stage.image || '');
    setEditingStage({ ...stage, index });
    setIsAddingNew(false);
  };

  const handleSaveStage = () => {
    // Use form state instead of editingStage to get current values
    if (!formYear.trim() || !formTitle.trim()) {
      alert('Please fill in year and title fields');
      return;
    }

    const updatedTimeline = [...storyTimeline];
    const stageData = {
      year: formYear.trim(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      image: formImage.trim()
    };
    
    if (isAddingNew) {
      updatedTimeline.push(stageData);
    } else {
      const index = editingStage.index;
      if (index !== undefined && updatedTimeline[index]) {
        updatedTimeline[index] = stageData;
      }
    }

    setStoryTimeline(updatedTimeline);
    
    // Clear form state and editing state
    setFormYear('');
    setFormTitle('');
    setFormDescription('');
    setFormImage('');
    setEditingStage(null);
    setIsAddingNew(false);
    
    // Save to backend only when user explicitly clicks save
    onSave({ story_timeline: updatedTimeline });
  };

  const handleDeleteStage = (index) => {
    if (!window.confirm('Are you sure you want to remove this story stage?')) return;
    
    const updatedTimeline = storyTimeline.filter((_, i) => i !== index);
    setStoryTimeline(updatedTimeline);
    
    // Save to backend immediately after confirmation
    onSave({ story_timeline: updatedTimeline });
  };

  const handleCancelEdit = () => {
    // Clear all form state when canceling
    setFormYear('');
    setFormTitle('');
    setFormDescription('');
    setFormImage('');
    setEditingStage(null);
    setIsAddingNew(false);
  };

  const StoryCard = ({ stage, index }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-golden text-white px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.primary }}>
              {stage.year}
            </span>
            <h4 className="text-lg font-semibold" style={{ color: theme.text }}>{stage.title}</h4>
          </div>
          <p className="text-sm mb-3" style={{ color: theme.textLight }}>{stage.description}</p>
          
          {stage.image && (
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200">
              <img 
                src={stage.image} 
                alt={stage.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>';
                }}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => handleEditStage(stage, index)}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
            title="Edit this story stage"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteStage(index)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            title="Delete this story stage"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const StoryForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
        {isAddingNew ? 'Add New Story Stage' : 'Edit Story Stage'}
      </h4>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Year *
            </label>
            <input
              ref={yearInputRef}
              type="text"
              value={formYear}
              onChange={handleYearChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2019"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={formTitle}
              onChange={handleTitleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., First Meeting, Engagement, etc."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Description
          </label>
          <textarea
            ref={descriptionInputRef}
            value={formDescription}
            onChange={handleDescriptionChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Tell the story of this milestone..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Image URL
          </label>
          <input
            ref={imageInputRef}
            type="url"
            value={formImage}
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/photo.jpg"
          />
          <p className="text-xs mt-1" style={{ color: theme.textLight }}>
            Use a direct link to an image (jpg, png, etc.)
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSaveStage}
          className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary }}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: theme.textLight }}>
        Create a beautiful timeline of your love story. Each stage represents a milestone in your relationship.
      </p>

      {/* Add New Stage Button */}
      {!editingStage && (
        <button
          onClick={handleAddStage}
          className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Plus className="w-5 h-5" />
          Add New Story Stage
        </button>
      )}

      {/* Story Form (Edit/Add) */}
      {editingStage && <StoryForm />}

      {/* Story Timeline */}
      <div className="space-y-4">
        {storyTimeline.length === 0 && !editingStage ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No story stages added yet</p>
          </div>
        ) : (
          storyTimeline.map((stage, index) => (
            <StoryCard key={index} stage={stage} index={index} />
          ))
        )}
      </div>
    </div>
  );
});

// Wedding Party Manager Component
// Wedding Party Manager Component - Complete CRUD Operations
const WeddingPartyManager = React.memo(({ weddingData, onSave, theme }) => {
  const [activeTab, setActiveTab] = useState('bridal');
  const [bridalParty, setBridalParty] = useState(weddingData?.bridal_party || []);
  const [groomParty, setGroomParty] = useState(weddingData?.groom_party || []);
  const [specialRoles, setSpecialRoles] = useState(weddingData?.special_roles || []);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Separate form state for each field to prevent focus loss
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formAge, setFormAge] = useState('');

  // Update local state when weddingData changes from parent
  useEffect(() => {
    if (weddingData?.bridal_party) setBridalParty(weddingData.bridal_party);
    if (weddingData?.groom_party) setGroomParty(weddingData.groom_party);
    if (weddingData?.special_roles) setSpecialRoles(weddingData.special_roles);
  }, [weddingData]);

  const tabs = [
    { id: 'bridal', label: 'Bride Party', data: bridalParty, setter: setBridalParty },
    { id: 'groom', label: 'Groom Party', data: groomParty, setter: setGroomParty },
    { id: 'special', label: 'Special Roles', data: specialRoles, setter: setSpecialRoles }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleAddPerson = () => {
    // Clear all form fields for new person
    setFormName('');
    setFormRole('');
    setFormRelationship('');
    setFormDescription('');
    setFormPhoto('');
    setFormAge('');
    setEditingPerson({
      id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      role: '',
      relationship: '',
      description: '',
      image: '',
      age: ''
    });
    setIsAddingNew(true);
  };

  const handleEditPerson = (person) => {
    // Load person data into separate form state variables
    setFormName(person.name || '');
    setFormRole(person.role || person.designation || '');
    setFormRelationship(person.relationship || '');
    setFormDescription(person.description || '');
    setFormPhoto(person.image || person.photo || '');
    setFormAge(person.age || '');
    setEditingPerson({ ...person });
    setIsAddingNew(false);
  };

  const handleSavePerson = () => {
    // Validation
    if (!formName.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!formRole.trim()) {
      alert('Please enter a role/title');
      return;
    }

    // Create updated person object from form state
    const updatedPerson = {
      id: editingPerson.id || `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formName.trim(),
      role: formRole.trim(),
      relationship: formRelationship.trim(),
      description: formDescription.trim(),
      image: formPhoto.trim(),
      age: formAge.trim()
    };

    let updatedData = [...activeTabData.data];
    
    if (isAddingNew) {
      // Add new person
      updatedData.push(updatedPerson);
    } else {
      // Update existing person
      const index = updatedData.findIndex(p => p.id === editingPerson.id);
      if (index !== -1) {
        updatedData[index] = updatedPerson;
      }
    }

    // Update local state
    activeTabData.setter(updatedData);
    
    // Clear form and editing state
    clearForm();
    
    // Save to backend IMMEDIATELY
    saveToBackend(activeTab, updatedData);
  };

  const saveToBackend = async (changedTab, updatedData) => {
    // Prepare data for all three parties
    const partyData = {
      bridal_party: changedTab === 'bridal' ? updatedData : bridalParty,
      groom_party: changedTab === 'groom' ? updatedData : groomParty,
      special_roles: changedTab === 'special' ? updatedData : specialRoles
    };
    
    console.log('💾 Saving Wedding Party data to MongoDB:', partyData);
    
    try {
      // Save to backend and wait for response
      await onSave(partyData);
      console.log('✅ Wedding Party data saved successfully!');
    } catch (error) {
      console.error('❌ Error saving Wedding Party data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleDeletePerson = (personId) => {
    if (!window.confirm('Are you sure you want to remove this person from the wedding party?')) {
      return;
    }
    
    const updatedData = activeTabData.data.filter(p => p.id !== personId);
    activeTabData.setter(updatedData);
    
    // Save to backend IMMEDIATELY after deletion
    saveToBackend(activeTab, updatedData);
    
    console.log('🗑️ Person deleted, data saved to MongoDB');
  };

  const clearForm = () => {
    setFormName('');
    setFormRole('');
    setFormRelationship('');
    setFormDescription('');
    setFormPhoto('');
    setFormAge('');
    setEditingPerson(null);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    clearForm();
  };

  const handleTabSwitch = (newTab) => {
    if (editingPerson) {
      const shouldSwitch = window.confirm('You have unsaved changes. Discard them and switch tabs?');
      if (!shouldSwitch) return;
      clearForm();
    }
    setActiveTab(newTab);
  };

  // Person Card Component with Edit/Delete buttons
  const PersonCard = ({ person }) => (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex gap-4 items-start">
        {/* Photo */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-gray-100">
          {person.image || person.photo ? (
            <img 
              src={person.image || person.photo} 
              alt={person.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg mb-1" style={{ color: theme.text }}>
            {person.name}
          </h4>
          <p className="font-semibold text-sm mb-1" style={{ color: theme.primary }}>
            {person.role || person.designation}
          </p>
          {person.relationship && (
            <p className="text-xs text-gray-600 mb-2">
              {person.relationship} {person.age && `• ${person.age}`}
            </p>
          )}
          {person.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {person.description}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditPerson(person);
            }}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeletePerson(person.id);
            }}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  // Person Form Component for Add/Edit
  const PersonForm = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-bold" style={{ color: theme.primary }}>
          {isAddingNew ? `✨ Add Person to ${activeTabData.label}` : `✏️ Edit Person`}
        </h4>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter full name"
            required
          />
        </div>
        
        {/* Role/Title Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
            Role/Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Maid of Honor, Best Man, Flower Girl"
            required
          />
        </div>
        
        {/* Relationship Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
            Relationship
          </label>
          <input
            type="text"
            value={formRelationship}
            onChange={(e) => setFormRelationship(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Sister & Best Friend, College Buddy"
          />
        </div>
        
        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
            Description
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            rows="3"
            placeholder="Write a brief description about this person..."
          />
        </div>
        
        {/* Photo URL Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
            Photo URL
          </label>
          <input
            type="url"
            value={formPhoto}
            onChange={(e) => setFormPhoto(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="https://example.com/photo.jpg or .png"
          />
          <p className="text-xs mt-1 text-gray-500">
            💡 Paste a direct link to a JPG or PNG image
          </p>
        </div>
        
        {/* Age Field (for Special Roles) */}
        {activeTab === 'special' && (
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: theme.text }}>
              Age (Optional)
            </label>
            <input
              type="text"
              value={formAge}
              onChange={(e) => setFormAge(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., Age 6, Age 8"
            />
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={handleSavePerson}
          className="flex-1 px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          style={{ backgroundColor: theme.primary }}
        >
          <Save className="w-5 h-5" />
          {isAddingNew ? 'Add Person' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTabSwitch(tab.id);
            }}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-md transform scale-105'
                : 'hover:bg-gray-200'
            }`}
            style={{
              color: activeTab === tab.id ? theme.primary : theme.textLight
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Person Button */}
      {!editingPerson && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddPerson();
          }}
          className="w-full py-4 border-2 border-dashed rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Plus className="w-6 h-6" />
          Add Person to {activeTabData.label}
        </button>
      )}

      {/* Person Form (Edit/Add) */}
      {editingPerson && <PersonForm />}

      {/* People List */}
      <div className="space-y-4">
        {activeTabData.data.length === 0 && !editingPerson ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-500">
              No people added to {activeTabData.label} yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Person" button above to get started
            </p>
          </div>
        ) : (
          activeTabData.data.map((person) => (
            <PersonCard key={person.id || `${person.name}_${Math.random()}`} person={person} />
          ))
        )}
      </div>
    </div>
  );
});

// Gallery Manager Component
const GalleryManager = React.memo(({ weddingData, onSave, theme }) => {
  const [galleryPhotos, setGalleryPhotos] = useState(weddingData?.gallery_photos || []);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Local form state to prevent re-renders during typing
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('all');
  const [formDescription, setFormDescription] = useState('');
  const [formEventMessage, setFormEventMessage] = useState('');

  // Photo categories/tags
  const photoCategories = [
    { id: 'all', name: 'All Photos', color: '#6366F1' },
    { id: 'engagement', name: 'Engagement', color: '#EC4899' },
    { id: 'travels', name: 'Our Travels', color: '#10B981' },
    { id: 'family', name: 'With Family', color: '#F59E0B' },
    { id: 'friends', name: 'With Friends', color: '#8B5CF6' }
  ];

  const handleAddPhoto = () => {
    // Initialize form state for new photo
    setFormUrl('');
    setFormTitle('');
    setFormCategory('all');
    setFormDescription('');
    setFormEventMessage('');
    setEditingPhoto({
      id: Date.now().toString(),
      url: '',
      title: '',
      description: '',
      category: 'all',
      eventMessage: ''
    });
    setIsAddingNew(true);
  };

  const handleEditPhoto = (photo) => {
    // Initialize form state with existing photo data
    setFormUrl(photo.url || '');
    setFormTitle(photo.title || '');
    setFormCategory(photo.category || 'all');
    setFormDescription(photo.description || '');
    setFormEventMessage(photo.eventMessage || '');
    setEditingPhoto({ ...photo });
    setIsAddingNew(false);
  };

  const handleSavePhoto = () => {
    // Use form state instead of editingPhoto to get current values
    if (!formUrl.trim() || !formTitle.trim()) {
      alert('Please fill in URL and title fields');
      return;
    }

    const updatedPhotos = [...galleryPhotos];
    const photoData = {
      id: editingPhoto.id,
      url: formUrl.trim(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      eventMessage: formEventMessage.trim()
    };
    
    if (isAddingNew) {
      updatedPhotos.push(photoData);
    } else {
      const index = updatedPhotos.findIndex(p => p.id === editingPhoto.id);
      if (index !== -1) {
        updatedPhotos[index] = photoData;
      }
    }

    setGalleryPhotos(updatedPhotos);
    
    // Clear form state and editing state
    setFormUrl('');
    setFormTitle('');
    setFormCategory('all');
    setFormDescription('');
    setFormEventMessage('');
    setEditingPhoto(null);
    setIsAddingNew(false);
    
    // Save to backend only when user explicitly clicks save
    onSave({ gallery_photos: updatedPhotos });
  };

  const handleDeletePhoto = (photoId) => {
    if (!window.confirm('Are you sure you want to remove this photo?')) return;
    
    const updatedPhotos = galleryPhotos.filter(p => p.id !== photoId);
    setGalleryPhotos(updatedPhotos);
    
    // Save to backend immediately after confirmation
    onSave({ gallery_photos: updatedPhotos });
  };

  const handleCancelEdit = () => {
    // Clear all form state when canceling
    setFormUrl('');
    setFormTitle('');
    setFormCategory('all');
    setFormDescription('');
    setFormEventMessage('');
    setEditingPhoto(null);
    setIsAddingNew(false);
  };

  const getCategoryColor = (categoryId) => {
    const category = photoCategories.find(c => c.id === categoryId);
    return category ? category.color : '#6366F1';
  };

  const PhotoCard = ({ photo }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img 
          src={photo.url} 
          alt={photo.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="14">Invalid Image URL</text></svg>';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg" style={{ color: theme.text }}>{photo.title}</h4>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getCategoryColor(photo.category) }}
          >
            {photoCategories.find(c => c.id === photo.category)?.name || 'All Photos'}
          </span>
        </div>
        
        {photo.description && (
          <p className="text-sm mb-2" style={{ color: theme.textLight }}>
            {photo.description}
          </p>
        )}
        
        {photo.eventMessage && (
          <div className="mb-3 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">{photo.eventMessage}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => handleEditPhoto(photo)}
            className="flex-1 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-blue-600 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDeletePhoto(photo.id)}
            className="flex-1 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors text-red-600 text-sm font-medium"
          >
            <X className="w-4 h-4 inline mr-1" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );

  const PhotoForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
        {isAddingNew ? 'Add New Photo' : 'Edit Photo'}
      </h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Photo URL (PNG/JPG only) *
          </label>
          <input
            type="url"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://images.unsplash.com/photo-example.jpg"
          />
          <p className="text-xs mt-1" style={{ color: theme.textLight }}>
            Use a direct link to a PNG or JPG image
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Photo Title *
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Engagement Session, Paris Adventure"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Category Tag *
          </label>
          <select
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {photoCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: theme.textLight }}>
            Choose which section this photo belongs to in the gallery
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Photo Description
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="Brief description of the photo..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Event Message
          </label>
          <textarea
            value={formEventMessage}
            onChange={(e) => setFormEventMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="What message do you want to show about this moment/event?"
          />
        </div>
        
        {/* Image Preview */}
        {formUrl && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Preview
            </label>
            <img
              src={formUrl}
              alt="Preview"
              className="w-32 h-24 object-cover rounded-lg border-2 shadow-md"
              style={{ borderColor: getCategoryColor(formCategory) }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="75" viewBox="0 0 100 75"><rect width="100" height="75" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="10">Invalid URL</text></svg>';
              }}
            />
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSavePhoto}
          className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary }}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={handleCancelEdit}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: theme.textLight }}>
        Add photos with URLs and organize them by category. Each photo can have a description and event message that will be displayed in the gallery.
      </p>

      {/* Add New Photo Button */}
      {!editingPhoto && (
        <button
          onClick={handleAddPhoto}
          className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Plus className="w-5 h-5" />
          Add New Photo
        </button>
      )}

      {/* Photo Form (Edit/Add) */}
      {editingPhoto && <PhotoForm />}

      {/* Photos Grid */}
      <div className="space-y-4">
        {galleryPhotos.length === 0 && !editingPhoto ? (
          <div className="text-center py-8">
            <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No photos added yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {galleryPhotos.map((photo) => (
              <PhotoCard key={photo.id || photo.url} photo={photo} />
            ))}
          </div>
        )}
      </div>

      {/* Category Legend */}
      {galleryPhotos.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium mb-3" style={{ color: theme.text }}>
            Category Colors:
          </h5>
          <div className="flex flex-wrap gap-2">
            {photoCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs" style={{ color: theme.textLight }}>
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Registry Manager Component
const RegistryManager = React.memo(({ weddingData, onSave, theme }) => {
  const [honeymoonFund, setHoneymoonFund] = useState(weddingData?.honeymoon_fund || {});
  const [contributions, setContributions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);

  // Fetch contributions when component mounts
  useEffect(() => {
    fetchContributions();
  }, [weddingData?.id]);

  const fetchContributions = async () => {
    if (!weddingData?.id) return;
    
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/payment/contributions/${weddingData.id}?session_id=${sessionId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setContributions(data.contributions || []);
        setTotalAmount(data.total_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/wedding/registry`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...honeymoonFund,
            session_id: sessionId
          }),
        }
      );

      if (response.ok) {
        // Update the wedding data
        onSave({ honeymoon_fund: honeymoonFund });
        setEditingConfig(false);
        alert('Honeymoon fund configuration saved successfully!');
      } else {
        alert('Failed to save configuration. Please try again.');
      }
    } catch (error) {
      console.error('Error saving honeymoon fund config:', error);
      alert('Error saving configuration. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          Registry Management
        </h3>
        <button
          onClick={() => setEditingConfig(!editingConfig)}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          style={{
            background: theme.gradientAccent,
            color: theme.primary
          }}
        >
          <Settings className="w-4 h-4" />
          {editingConfig ? 'Cancel' : 'Configure'}
        </button>
      </div>

      {/* Configuration Form */}
      {editingConfig && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
            Honeymoon Fund Configuration
          </h4>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              UPI ID (for receiving payments)
            </label>
            <input
              type="text"
              value={honeymoonFund.upi_id || ''}
              onChange={(e) => setHoneymoonFund({ ...honeymoonFund, upi_id: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., yourname@paytm, yourname@phonepe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Phone Number (alternative payment method)
            </label>
            <input
              type="tel"
              value={honeymoonFund.phone_number || ''}
              onChange={(e) => setHoneymoonFund({ ...honeymoonFund, phone_number: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., +91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Honeymoon Destination
            </label>
            <input
              type="text"
              value={honeymoonFund.destination || ''}
              onChange={(e) => setHoneymoonFund({ ...honeymoonFund, destination: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tokyo & Kyoto, Japan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Description Message
            </label>
            <textarea
              value={honeymoonFund.description || ''}
              onChange={(e) => setHoneymoonFund({ ...honeymoonFund, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Help us create unforgettable memories on our honeymoon. Every contribution, big or small, means the world to us!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Honeymoon Photo URL
            </label>
            <input
              type="url"
              value={honeymoonFund.image_url || ''}
              onChange={(e) => setHoneymoonFund({ ...honeymoonFund, image_url: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://images.unsplash.com/photo-example.jpg"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
              <input
                type="checkbox"
                checked={honeymoonFund.is_active || false}
                onChange={(e) => setHoneymoonFund({ ...honeymoonFund, is_active: e.target.checked })}
                className="rounded"
                style={{ accentColor: theme.accent }}
              />
              Enable Honeymoon Fund (allow contributions)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Current Configuration Display */}
      {!editingConfig && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
            Current Configuration
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium" style={{ color: theme.text }}>UPI ID:</span>
              <p style={{ color: theme.textLight }}>
                {honeymoonFund.upi_id || 'Not configured'}
              </p>
            </div>
            <div>
              <span className="font-medium" style={{ color: theme.text }}>Phone:</span>
              <p style={{ color: theme.textLight }}>
                {honeymoonFund.phone_number || 'Not configured'}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium" style={{ color: theme.text }}>Destination:</span>
              <p style={{ color: theme.textLight }}>
                {honeymoonFund.destination || 'Not configured'}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium" style={{ color: theme.text }}>Status:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                honeymoonFund.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {honeymoonFund.is_active ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contributions Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
            Contributions Summary
          </h4>
          <button
            onClick={fetchContributions}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: theme.accent }}
          >
            Refresh
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>
              ₹{totalAmount.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: theme.textLight }}>Total Raised</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>
              {contributions.length}
            </div>
            <div className="text-sm" style={{ color: theme.textLight }}>Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>
              ₹{contributions.length > 0 ? Math.round(totalAmount / contributions.length) : 0}
            </div>
            <div className="text-sm" style={{ color: theme.textLight }}>Avg. Contribution</div>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      {contributions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
              Recent Contributions
            </h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p style={{ color: theme.textLight }}>Loading contributions...</p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {contributions.map((contribution, index) => (
                  <div key={contribution.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: theme.gradientAccent }}
                        >
                          <Heart className="w-5 h-5" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <h5 className="font-semibold" style={{ color: theme.text }}>
                            {contribution.contributor_name}
                          </h5>
                          <p className="text-sm" style={{ color: theme.textLight }}>
                            {formatDate(contribution.created_at)}
                          </p>
                        </div>
                      </div>
                      {contribution.message && (
                        <p className="text-sm italic ml-13" style={{ color: theme.textLight }}>
                          "{contribution.message}"
                        </p>
                      )}
                      {contribution.contributor_email && (
                        <p className="text-xs ml-13" style={{ color: theme.textLight }}>
                          {contribution.contributor_email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold" style={{ color: theme.primary }}>
                        ₹{contribution.amount}
                      </div>
                      <div className="text-xs" style={{ color: theme.textLight }}>
                        {contribution.currency.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contributions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: theme.gradientAccent }}
          >
            <Gift className="w-8 h-8" style={{ color: theme.primary }} />
          </div>
          <p className="text-lg mb-2" style={{ color: theme.text }}>
            No Contributions Yet
          </p>
          <p className="text-sm" style={{ color: theme.textLight }}>
            When guests contribute to your honeymoon fund, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
});

// Schedule Manager Component  
const ScheduleManager = React.memo(({ weddingData, onSave, theme }) => {
  const [scheduleEvents, setScheduleEvents] = useState(weddingData?.schedule_events || []);
  const [importantInfo, setImportantInfo] = useState(weddingData?.important_info || {});
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingInfoItem, setEditingInfoItem] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingInfo, setIsAddingInfo] = useState(false);
  
  // Local form state to prevent re-renders during typing - FIX FOR INPUT FOCUS LOSS
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHighlight, setFormHighlight] = useState(false);

  const defaultInfoItems = [
    { id: 'dress_code', title: 'Dress Code', description: 'Formal/Black Tie Optional. We encourage elegant attire in garden-friendly footwear.', icon: 'Users' },
    { id: 'weather_plan', title: 'Weather Plan', description: 'Our venue has both indoor and covered outdoor spaces for any weather conditions.', icon: 'Calendar' },
    { id: 'transportation', title: 'Transportation', description: 'Complimentary shuttle service available from nearby hotels. Valet parking provided.', icon: 'MapPin' },
    { id: 'special_accommodations', title: 'Special Accommodations', description: 'Please let us know of any accessibility needs or dietary restrictions in your RSVP.', icon: 'Users' }
  ];

  const handleAddEvent = () => {
    // Initialize form state for new event
    setFormTitle('');
    setFormTime('12:00 PM');
    setFormDate(weddingData?.wedding_date || '');
    setFormDuration('1 hour');
    setFormLocation('');
    setFormDescription('');
    setFormHighlight(false);
    setEditingEvent({
      id: Date.now().toString(),
      index: undefined
    });
    setIsAddingEvent(true);
  };

  const handleEditEvent = (event, index) => {
    // Initialize form state with existing event data
    setFormTitle(event.title || '');
    setFormTime(event.time || '');
    setFormDate(event.date || '');
    setFormDuration(event.duration || '');
    setFormLocation(event.location || '');
    setFormDescription(event.description || '');
    setFormHighlight(event.highlight || false);
    setEditingEvent({ 
      id: event.id || Date.now().toString(),
      index 
    });
    setIsAddingEvent(false);
  };

  const handleSaveEvent = () => {
    // Use form state instead of editingEvent to get current values
    if (!formTitle.trim() || !formTime.trim()) {
      alert('Please fill in title and time fields');
      return;
    }

    const updatedEvents = [...scheduleEvents];
    const eventData = {
      id: editingEvent.id,
      time: formTime.trim(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      location: formLocation.trim(),
      duration: formDuration.trim(),
      date: formDate,
      highlight: formHighlight
    };
    
    if (isAddingEvent) {
      updatedEvents.push(eventData);
    } else {
      const index = editingEvent.index;
      if (index !== undefined && updatedEvents[index]) {
        updatedEvents[index] = eventData;
      }
    }

    setScheduleEvents(updatedEvents);
    
    // Clear form state and editing state
    setFormTitle('');
    setFormTime('');
    setFormDate('');
    setFormDuration('');
    setFormLocation('');
    setFormDescription('');
    setFormHighlight(false);
    setEditingEvent(null);
    setIsAddingEvent(false);
    
    // Save to backend only when user explicitly clicks save
    onSave({ schedule_events: updatedEvents });
  };

  const handleDeleteEvent = (index) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    
    const updatedEvents = scheduleEvents.filter((_, i) => i !== index);
    setScheduleEvents(updatedEvents);
    
    // Save to backend immediately after confirmation
    onSave({ schedule_events: updatedEvents });
  };

  const handleCancelEditEvent = () => {
    // Clear all form state when canceling
    setFormTitle('');
    setFormTime('');
    setFormDate('');
    setFormDuration('');
    setFormLocation('');
    setFormDescription('');
    setFormHighlight(false);
    setEditingEvent(null);
    setIsAddingEvent(false);
  };

  // Important Information Management
  const handleAddInfoItem = () => {
    setEditingInfoItem({
      id: Date.now().toString(),
      title: '',
      description: '',
      enabled: true
    });
    setIsAddingInfo(true);
  };

  const handleEditInfoItem = (item) => {
    setEditingInfoItem({ ...item });
    setIsAddingInfo(false);
  };

  const handleSaveInfoItem = () => {
    if (!editingInfoItem.title) {
      alert('Please fill in the title field');
      return;
    }

    const updatedInfo = { ...importantInfo };
    updatedInfo[editingInfoItem.id] = {
      title: editingInfoItem.title,
      description: editingInfoItem.description,
      enabled: editingInfoItem.enabled
    };

    setImportantInfo(updatedInfo);
    setEditingInfoItem(null);
    setIsAddingInfo(false);
    
    // Save to backend immediately
    onSave({ important_info: updatedInfo });
  };

  const handleDeleteInfoItem = (itemId) => {
    if (!window.confirm('Are you sure you want to remove this information item?')) return;
    
    const updatedInfo = { ...importantInfo };
    delete updatedInfo[itemId];
    setImportantInfo(updatedInfo);
    
    // Save to backend immediately
    onSave({ important_info: updatedInfo });
  };

  const EventCard = ({ event, index }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: event.highlight ? theme.accent : '#e5e7eb' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {event.highlight && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
                Highlighted
              </span>
            )}
            <h4 className="text-lg font-semibold" style={{ color: theme.text }}>{event.title}</h4>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: theme.accent }} />
              <span style={{ color: theme.textLight }}>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: theme.accent }} />
              <span style={{ color: theme.textLight }}>{event.date || 'No date set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: theme.accent }} />
              <span style={{ color: theme.textLight }}>Duration: {event.duration}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                <span style={{ color: theme.textLight }}>{event.location}</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="text-sm mb-3" style={{ color: theme.textLight }}>
              {event.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => handleEditEvent(event, index)}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
            title="Edit this event"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteEvent(index)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            title="Delete this event"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const EventForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
        {isAddingEvent ? 'Add New Event' : 'Edit Event'}
      </h4>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Event Title *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Wedding Ceremony, Reception"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Time *
            </label>
            <input
              type="text"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2:00 PM"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Date
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Duration
            </label>
            <input
              type="text"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 hour, 30 minutes"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Location
          </label>
          <input
            type="text"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Main Hall, Garden Area"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Description
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Brief description of the event..."
          />
        </div>
        
        <div>
          <label className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
            <input
              type="checkbox"
              checked={formHighlight}
              onChange={(e) => setFormHighlight(e.target.checked)}
              className="rounded"
              style={{ accentColor: theme.accent }}
            />
            Highlight this event (makes it stand out in the timeline)
          </label>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSaveEvent}
          className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary }}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={handleCancelEditEvent}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const InfoCard = ({ item, itemId }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-semibold text-lg" style={{ color: theme.text }}>{item.title}</h5>
        <div className="flex gap-2">
          <button
            onClick={() => handleEditInfoItem({ ...item, id: itemId })}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
            title="Edit this information"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteInfoItem(itemId)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            title="Delete this information"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <p className="text-sm" style={{ color: theme.textLight }}>{item.description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Schedule Events Section */}
      <div>
        <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
          Wedding Day Timeline
        </h4>
        <p className="text-sm mb-6" style={{ color: theme.textLight }}>
          Create your wedding day schedule with events, times, and locations. Each card can be edited or removed individually.
        </p>

        {/* Add New Event Button */}
        {!editingEvent && (
          <button
            onClick={handleAddEvent}
            className="w-full py-3 mb-6 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            <Plus className="w-5 h-5" />
            Add New Event
          </button>
        )}

        {/* Event Form (Edit/Add) */}
        {editingEvent && <EventForm />}

        {/* Events List */}
        <div className="space-y-4">
          {scheduleEvents.length === 0 && !editingEvent ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No events added yet</p>
            </div>
          ) : (
            scheduleEvents.map((event, index) => (
              <EventCard key={event.id || index} event={event} index={index} />
            ))
          )}
        </div>
      </div>

      {/* Important Information Section */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
          Important Information
        </h4>
        <p className="text-sm mb-6" style={{ color: theme.textLight }}>
          Add important information for your guests like dress code, weather plan, transportation, etc.
        </p>

        {/* Important Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Default info items */}
          {defaultInfoItems.map((defaultItem) => {
            const savedItem = importantInfo[defaultItem.id];
            const item = savedItem || { title: defaultItem.title, description: defaultItem.description, enabled: true };
            
            return (
              <InfoCard key={defaultItem.id} item={item} itemId={defaultItem.id} />
            );
          })}
          
          {/* Custom info items */}
          {Object.entries(importantInfo).map(([itemId, item]) => {
            if (!defaultInfoItems.find(d => d.id === itemId)) {
              return (
                <InfoCard key={itemId} item={item} itemId={itemId} />
              );
            }
            return null;
          })}
        </div>

        {/* Add New Info Button */}
        <button
          onClick={handleAddInfoItem}
          className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Plus className="w-5 h-5" />
          Add Custom Information
        </button>
      </div>
    </div>
  );
});

const LeftSidebar = () => {
  const { themes, currentTheme, setCurrentTheme } = useAppTheme();
  const theme = React.useMemo(() => themes[currentTheme], [themes, currentTheme]);
  const { 
    leftSidebarOpen, 
    setLeftSidebarOpen, 
    logout, 
    userInfo,
    isAuthenticated,
    weddingData,
    saveWeddingData 
  } = useUserData();

  const [activeSection, setActiveSection] = useState('info');
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [activeForm, setActiveForm] = useState(null);
  const modalRef = useRef(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef(null);

  const editSections = [
    { id: 'home', label: 'Home', icon: Heart, description: 'Edit couple names, date, venue' },
    { id: 'story', label: 'Our Story', icon: Heart, description: 'Timeline and love story' },
    { id: 'rsvp', label: 'RSVP', icon: Mail, description: 'RSVP form settings' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Wedding day timeline' },
    { id: 'gallery', label: 'Gallery', icon: Image, description: 'Photo gallery' },
    { id: 'party', label: 'Wedding Party', icon: Users, description: 'Bridal and groom party' },
    { id: 'registry', label: 'Registry', icon: Gift, description: 'Gift registry links' },
    { id: 'guestbook', label: 'Guest Book', icon: MessageCircle, description: 'Guest messages' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
    { id: 'theme', label: 'Theme', icon: Settings, description: 'Classic, Modern, or Boho' }
  ];

  // Main sidebar sections - reorganized as requested
  const sidebarSections = [
    { id: 'info', label: 'Edit the Info', icon: Edit3, expandable: true, color: '#6366F1' },
    { id: 'whatsapp', label: 'Share via WhatsApp', icon: MessageSquare, color: '#25D366' },
    { id: 'gmail', label: 'Share via Gmail', icon: Mail, color: '#EA4335' },
    { id: 'qrcode', label: 'Get QR Code', icon: QrCode, color: '#6366F1' },
    { id: 'url', label: 'Get Shareable URL', icon: Link, color: '#3B82F6' },
    { id: 'ai', label: 'Generate Design with AI', icon: Wand2, color: '#8B5CF6' }
  ];

  // Handle click outside modal - FIXED to prevent unwanted form closes
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Enhanced check for interactive elements and modal content
      const isWithinModal = modalRef.current && modalRef.current.contains(event.target);
      const isInteractiveElement = event.target.tagName === 'INPUT' || 
                                 event.target.tagName === 'BUTTON' || 
                                 event.target.tagName === 'SELECT' || 
                                 event.target.tagName === 'TEXTAREA' ||
                                 event.target.tagName === 'LABEL' ||
                                 event.target.closest('.modal-content') ||
                                 event.target.closest('input') ||
                                 event.target.closest('textarea') ||
                                 event.target.closest('select') ||
                                 event.target.closest('button') ||
                                 event.target.closest('label');
      
      // PRIORITY 1: If modal is open and click is within modal, do nothing (keep modal open)
      if (activeForm && isWithinModal) {
        return;
      }
      
      // PRIORITY 2: Only close modal if clicked completely outside modal and not on any interactive element
      if (activeForm && modalRef.current && !isWithinModal && !isInteractiveElement) {
        // Close modal without auto-save (user must explicitly save)
        setActiveForm(null);
        return;
      }
      
      // PRIORITY 3: Handle sidebar click outside when expanded by hover (only if no modal is open)
      if (!activeForm && sidebarRef.current && !sidebarRef.current.contains(event.target) && !leftSidebarOpen && isHovering) {
        setIsHovering(false);
      }
    };

    // Only add one listener regardless of conditions
    if (activeForm || (!leftSidebarOpen && isHovering)) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    if (activeForm) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeForm, leftSidebarOpen, isHovering]);

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && activeForm) {
      setActiveForm(null);
    }
  };

  const handleCloseForm = useCallback(() => {
    setActiveForm(null);
  }, []);

  const handleSectionClick = (sectionId) => {
    switch (sectionId) {
      case 'whatsapp':
      case 'gmail':
        handlePremiumFeature(sectionId);
        break;
      case 'qrcode':
        setActiveForm('qrcode-generator');
        break;
      case 'url':
        handlePremiumFeature(sectionId);
        break;
      case 'ai':
        setActiveForm('ai-design');
        break;
      default:
        break;
    }
  };

  const handlePremiumFeature = (featureId) => {
    // Get the system-generated custom URL from wedding data
    const shareableUrl = weddingData.custom_url 
      ? `${window.location.origin}/${weddingData.custom_url}`
      : `${window.location.origin}/wedding/${userInfo.userId}`;
    
    console.log('Shareable URL:', shareableUrl, 'Custom URL:', weddingData.custom_url);
    
    switch (featureId) {
      case 'whatsapp':
        const whatsappText = `Check out our wedding card! 💒✨ ${weddingData.couple_name_1} & ${weddingData.couple_name_2} are getting married on ${weddingData.wedding_date}! ${shareableUrl}`;
        
        // Detect if user is on mobile or desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile: Open WhatsApp app directly with pre-filled message
          const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(whatsappText)}`;
          window.open(whatsappAppUrl, '_blank');
        } else {
          // Desktop: Open WhatsApp Web with pre-filled message - allows selecting multiple contacts
          const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
          window.open(whatsappWebUrl, '_blank');
        }
        break;
      
      case 'gmail':
        const subject = `${weddingData.couple_name_1} & ${weddingData.couple_name_2}'s Wedding Invitation`;
        const body = `You're invited to our wedding! 💕\n\nView our beautiful wedding card: ${shareableUrl}\n\nDate: ${weddingData.wedding_date}\nVenue: ${weddingData.venue_location}\n\nWe can't wait to celebrate with you!\n\nWith love,\n${weddingData.couple_name_1} & ${weddingData.couple_name_2}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
        break;
      
      case 'qrcode':
        // Generate QR code using QR Server API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareableUrl)}`;
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head><title>QR Code - Wedding Card</title></head>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; background: linear-gradient(135deg, #f8f6f0, #ffffff);">
              <h2 style="color: #333; margin-bottom: 20px;">Wedding Card QR Code</h2>
              <img src="${qrUrl}" alt="QR Code" style="border: 4px solid #d4af37; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
              <p style="color: #666; margin-top: 20px; text-align: center; max-width: 300px;">Scan this QR code to view the wedding card</p>
              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #f4e4a6); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Print QR Code</button>
            </body>
          </html>
        `);
        break;
      
      case 'url':
        copyToClipboardWithFallback(shareableUrl).then(() => {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        }).catch((error) => {
          console.error('Failed to copy URL:', error);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        });
        break;
      
      case 'ai':
        // AI Design Generator Modal
        setActiveForm('ai-design');
        break;
      
      default:
        break;
    }
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-right">
          <CheckCircle className="w-5 h-5" />
          <span>
            {activeForm === 'url' ? 'URL copied to clipboard!' : 'Changes saved automatically!'}
          </span>
        </div>
      )}

      {/* Left Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full backdrop-blur-xl border-r border-white/30 shadow-2xl transition-all duration-500 ease-in-out z-40 ${
          leftSidebarOpen || (!leftSidebarOpen && isHovering) ? 'w-80 md:w-80' : 'w-16 md:w-20'
        }`}
        style={{ 
          background: window.innerWidth <= 768 
            ? `linear-gradient(135deg, ${theme.background}70, ${theme.secondary}60)` // More translucent on mobile
            : `linear-gradient(135deg, ${theme.background}f0, ${theme.secondary}e0)`, // Less translucent on desktop
          borderColor: `${theme.accent}20`
        }}
        onMouseEnter={() => {
          // Only enable hover on desktop
          if (!leftSidebarOpen && window.innerWidth > 768) {
            setIsHovering(true);
          }
        }}
        onMouseLeave={() => {
          // Don't auto-close on mouse leave - user requested it stays open
          // It will only close when clicking outside
        }}
        onClick={(e) => {
          // On mobile, clicking the sidebar when collapsed should open it
          if (window.innerWidth <= 768 && !leftSidebarOpen && e.target === e.currentTarget) {
            setLeftSidebarOpen(true);
          }
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute -right-4 top-20 w-8 h-16 bg-white border border-gray-200 rounded-r-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-50"
          style={{ 
            background: theme.gradientAccent,
            borderColor: `${theme.accent}30`
          }}
        >
          {leftSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" style={{ color: theme.primary }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: theme.primary }} />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: theme.gradientAccent }}
              >
                <Edit3 className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              {leftSidebarOpen || (!leftSidebarOpen && isHovering) && (
                <div>
                  <h2 
                    className="text-lg font-semibold"
                    style={{ 
                      fontFamily: theme.fontPrimary,
                      color: theme.primary 
                    }}
                  >
                    Wedding Editor
                  </h2>
                  <p className="text-sm opacity-70" style={{ color: theme.textLight }}>
                    Welcome, {userInfo?.username}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isInfoSection = section.id === 'info';
                
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        if (isInfoSection) {
                          setInfoExpanded(!infoExpanded);
                        } else {
                          // Handle premium features and custom actions
                          handleSectionClick(section.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isActive ? 'shadow-lg' : 'hover:shadow-md'
                      }`}
                      style={{
                        background: isActive 
                          ? theme.gradientAccent 
                          : 'rgba(255,255,255,0.1)',
                        color: isActive 
                          ? theme.primary 
                          : theme.text
                      }}
                      title={!(leftSidebarOpen || isHovering) ? section.label : ''}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: section.color || theme.text }}
                        />
                        {(leftSidebarOpen || (!leftSidebarOpen && isHovering)) && (
                          <span className="font-medium">{section.label}</span>
                        )}
                      </div>
                      {(leftSidebarOpen || (!leftSidebarOpen && isHovering)) && isInfoSection && (
                        infoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Info Section Dropdown */}
                    {isInfoSection && infoExpanded && (leftSidebarOpen || (!leftSidebarOpen && isHovering)) && (
                      <div className="mt-2 ml-4 space-y-1">
                        {editSections.map((editSection) => {
                          const EditIcon = editSection.icon;
                          return (
                            <button
                              key={editSection.id}
                              onClick={() => setActiveForm(editSection.id)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 group animate-fade-in"
                              style={{ color: theme.textLight }}
                            >
                              <EditIcon className="w-4 h-4" />
                              <div className="text-left">
                                <div className="text-sm font-medium group-hover:font-semibold transition-all duration-200">
                                  {editSection.label}
                                </div>
                                <div className="text-xs opacity-70">
                                  {editSection.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Section removed - premium features now integrated into main navigation */}
          </div>

          {/* Footer - Logout */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-red-500/10 hover:scale-105"
              style={{ color: theme.textLight }}
              title={!(leftSidebarOpen || isHovering) ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5" />
              {(leftSidebarOpen || (!leftSidebarOpen && isHovering)) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Form Popups */}
      {activeForm && (
        <FormPopup
          sectionId={activeForm}
          onClose={handleCloseForm}
          theme={theme}
          modalRef={modalRef}
        />
      )}

      {/* Main Content Pusher - Adds margin when sidebar is open */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          leftSidebarOpen ? 'ml-80' : 'ml-20'
        }`}
        style={{ minHeight: '100vh' }}
      />
    </>
  );
};

// Enhanced Form Popup Component with Auto-save and Premium Features - OPTIMIZED FOR FOCUS RETENTION
const FormPopup = React.memo(({ sectionId, onClose, theme, modalRef }) => {
  const { weddingData: contextWeddingData, saveWeddingData } = useUserData();
  const { themes, currentTheme, setCurrentTheme } = useAppTheme();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  
  // Use ref to hold wedding data to prevent re-renders during editing
  const [localWeddingData, setLocalWeddingData] = useState(contextWeddingData);
  const weddingDataRef = useRef(contextWeddingData);
  
  // Schedule-specific state
  const [scheduleEvents, setScheduleEvents] = useState(contextWeddingData?.schedule_events || []);
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [isAddingNewEvent, setIsAddingNewEvent] = useState(false);
  const [eventFormTitle, setEventFormTitle] = useState('');
  const [eventFormTime, setEventFormTime] = useState('');
  const [eventFormDate, setEventFormDate] = useState('');
  const [eventFormDuration, setEventFormDuration] = useState('');
  const [eventFormLocation, setEventFormLocation] = useState('');
  const [eventFormDescription, setEventFormDescription] = useState('');
  const [eventFormHighlight, setEventFormHighlight] = useState(false);
  
  // Important Info state
  const [importantInfo, setImportantInfo] = useState(contextWeddingData?.important_info || {});
  const [editingInfoItem, setEditingInfoItem] = useState(null);
  const [isAddingInfo, setIsAddingInfo] = useState(false);
  const [infoFormTitle, setInfoFormTitle] = useState('');
  const [infoFormDescription, setInfoFormDescription] = useState('');
  
  // Gallery-specific state
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState(null);
  const [isAddingNewPhoto, setIsAddingNewPhoto] = useState(false);
  
  // Wedding Party state
  const [activePartyTab, setActivePartyTab] = useState('bride');
  const [editingPartyPerson, setEditingPartyPerson] = useState(null);
  const [isAddingPartyPerson, setIsAddingPartyPerson] = useState(false);
  const [partyPersonName, setPartyPersonName] = useState('');
  const [partyPersonRole, setPartyPersonRole] = useState('');
  const [partyPersonDescription, setPartyPersonDescription] = useState('');
  const [partyPersonPhoto, setPartyPersonPhoto] = useState('');
  
  // Only update local data when context data changes AND we're not currently editing
  useEffect(() => {
    if (!saving) {
      setLocalWeddingData(contextWeddingData);
      weddingDataRef.current = contextWeddingData;
      setScheduleEvents(contextWeddingData?.schedule_events || []);
      setImportantInfo(contextWeddingData?.important_info || {});
    }
  }, [contextWeddingData, saving]);

  // Removed aggressive auto-save functionality to prevent focus loss and form closing issues

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Manual save when user explicitly submits
    if (Object.keys(formData).length > 0) {
      try {
        const updatedData = { ...weddingDataRef.current };
        
        // Handle Our Story section - add new or edit existing stage
        if (sectionId === 'story' && (formData.story_year || formData.story_title)) {
          if (!formData.story_year?.trim() || !formData.story_title?.trim()) {
            alert('Please fill in Year and Title fields for the story stage');
            setSaving(false);
            return;
          }
          
          const storyTimeline = updatedData.story_timeline || [];
          const stageData = {
            year: formData.story_year.trim(),
            title: formData.story_title.trim(),
            description: formData.story_description?.trim() || '',
            image: formData.story_image?.trim() || ''
          };
          
          // Check if we're editing an existing stage
          if (formData.editing_story_index !== undefined && formData.editing_story_index >= 0) {
            // Update existing stage
            storyTimeline[formData.editing_story_index] = stageData;
          } else {
            // Add new stage
            storyTimeline.push(stageData);
          }
          
          updatedData.story_timeline = storyTimeline;
          
          // Clear story form fields after adding/editing
          const newFormData = { ...formData };
          delete newFormData.story_year;
          delete newFormData.story_title;
          delete newFormData.story_description;
          delete newFormData.story_image;
          delete newFormData.editing_story_index;
          setFormData(newFormData);
        } 
        // Schedule section now handles its own save logic directly in the case statement
        // Handle Gallery section - add new photo
        else if (sectionId === 'gallery' && formData.gallery_url) {
          if (!formData.gallery_url?.trim()) {
            alert('Please provide a Photo URL');
            setSaving(false);
            return;
          }
          
          const galleryPhotos = updatedData.gallery_photos || [];
          galleryPhotos.push({
            url: formData.gallery_url.trim(),
            title: formData.gallery_title?.trim() || '',
            description: formData.gallery_description?.trim() || '',
            category: formData.gallery_category || 'engagement'
          });
          updatedData.gallery_photos = galleryPhotos;
          
          // Clear gallery form fields after adding
          setFormData({});
        } 
        // Handle Wedding Party section - add new member
        else if (sectionId === 'party' && formData.party_name) {
          if (!formData.party_name?.trim() || !formData.party_designation?.trim()) {
            alert('Please fill in Name and Designation fields');
            setSaving(false);
            return;
          }
          
          const partySide = formData.party_side || 'bride';
          const partyMember = {
            name: formData.party_name.trim(),
            designation: formData.party_designation.trim(),
            description: formData.party_description?.trim() || '',
            photo: formData.party_photo?.trim() || ''
          };
          
          if (partySide === 'bride') {
            const bridalParty = updatedData.bridal_party || [];
            bridalParty.push(partyMember);
            updatedData.bridal_party = bridalParty;
          } else {
            const groomParty = updatedData.groom_party || [];
            groomParty.push(partyMember);
            updatedData.groom_party = groomParty;
          }
          
          // Clear party form fields after adding
          setFormData({});
        } 
        else {
          // For other sections, directly update fields
          Object.keys(formData).forEach(field => {
            updatedData[field] = formData[field];
          });
        }
        
        await saveWeddingData(updatedData);
        
        // Update local data immediately to reflect changes
        setLocalWeddingData(updatedData);
        weddingDataRef.current = updatedData;
        
        setSaving(false);
        
        // Only close if not story, schedule, gallery or party section (so user can add multiple entries)
        if (sectionId !== 'story' && sectionId !== 'schedule' && sectionId !== 'gallery' && sectionId !== 'party') {
          onClose();
        }
      } catch (error) {
        console.error('Error saving data:', error);
        setSaving(false);
        alert('Failed to save data. Please check your connection and try again.');
      }
    } else {
      setSaving(false);
      onClose();
    }
  };

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized handlers for specific fields to prevent re-renders
  const handleCoupleName1Change = useCallback((e) => {
    handleChange('couple_name_1', e.target.value);
  }, [handleChange]);

  const handleCoupleName2Change = useCallback((e) => {
    handleChange('couple_name_2', e.target.value);
  }, [handleChange]);

  const handleWeddingDateChange = useCallback((e) => {
    handleChange('wedding_date', e.target.value);
  }, [handleChange]);

  const handleVenueNameChange = useCallback((e) => {
    handleChange('venue_name', e.target.value);
  }, [handleChange]);

  const handleVenueLocationChange = useCallback((e) => {
    handleChange('venue_location', e.target.value);
  }, [handleChange]);

  const handleTheirStoryChange = useCallback((e) => {
    handleChange('their_story', e.target.value);
  }, [handleChange]);

  // Our Story section handlers
  const handleStoryYearChange = useCallback((e) => {
    handleChange('story_year', e.target.value);
  }, [handleChange]);

  const handleStoryTitleChange = useCallback((e) => {
    handleChange('story_title', e.target.value);
  }, [handleChange]);

  const handleStoryDescriptionChange = useCallback((e) => {
    handleChange('story_description', e.target.value);
  }, [handleChange]);

  const handleStoryImageChange = useCallback((e) => {
    handleChange('story_image', e.target.value);
  }, [handleChange]);

  // Schedule section handlers
  const handleScheduleTimeChange = useCallback((e) => {
    handleChange('schedule_time', e.target.value);
  }, [handleChange]);

  const handleScheduleTitleChange = useCallback((e) => {
    handleChange('schedule_title', e.target.value);
  }, [handleChange]);

  const handleScheduleDescriptionChange = useCallback((e) => {
    handleChange('schedule_description', e.target.value);
  }, [handleChange]);

  const handleScheduleLocationChange = useCallback((e) => {
    handleChange('schedule_location', e.target.value);
  }, [handleChange]);

  const handleScheduleDurationChange = useCallback((e) => {
    handleChange('schedule_duration', e.target.value);
  }, [handleChange]);

  // Gallery section handlers
  const handleGalleryUrlChange = useCallback((e) => {
    handleChange('gallery_url', e.target.value);
  }, [handleChange]);

  const handleGalleryTitleChange = useCallback((e) => {
    handleChange('gallery_title', e.target.value);
  }, [handleChange]);

  const handleGalleryDescriptionChange = useCallback((e) => {
    handleChange('gallery_description', e.target.value);
  }, [handleChange]);

  const handleGalleryCategoryChange = useCallback((e) => {
    handleChange('gallery_category', e.target.value);
  }, [handleChange]);
  
  const handleGalleryEventMessageChange = useCallback((e) => {
    handleChange('gallery_event_message', e.target.value);
  }, [handleChange]);

  // Wedding Party section handlers
  const handlePartyNameChange = useCallback((e) => {
    handleChange('party_name', e.target.value);
  }, [handleChange]);

  const handlePartyDesignationChange = useCallback((e) => {
    handleChange('party_designation', e.target.value);
  }, [handleChange]);

  const handlePartyDescriptionChange = useCallback((e) => {
    handleChange('party_description', e.target.value);
  }, [handleChange]);

  const handlePartyPhotoChange = useCallback((e) => {
    handleChange('party_photo', e.target.value);
  }, [handleChange]);

  const handlePartySideChange = useCallback((e) => {
    handleChange('party_side', e.target.value);
  }, [handleChange]);

  // Gallery Photo Handlers
  const handleSaveGalleryPhoto = async () => {
    // Validate required fields
    if (!formData.gallery_url || !formData.gallery_title) {
      alert('Please fill in URL and title fields');
      return;
    }

    const updatedPhotos = [...(localWeddingData.gallery_photos || [])];
    
    // Get the existing photo ID if editing, otherwise create new one
    const existingPhoto = (editingGalleryPhoto !== null && !isAddingNewPhoto) 
      ? updatedPhotos[editingGalleryPhoto] 
      : null;
    
    const photoData = {
      id: existingPhoto?.id || Date.now().toString(), // Preserve existing ID when editing
      url: formData.gallery_url.trim(),
      title: formData.gallery_title.trim(),
      category: formData.gallery_category || 'all',
      description: formData.gallery_description?.trim() || '',
      eventMessage: formData.gallery_event_message?.trim() || ''
    };

    if (isAddingNewPhoto) {
      // Add new photo
      updatedPhotos.push(photoData);
    } else if (editingGalleryPhoto !== null) {
      // Update existing photo (preserves the ID)
      updatedPhotos[editingGalleryPhoto] = photoData;
    }

    // Update local state
    setLocalWeddingData(prev => ({
      ...prev,
      gallery_photos: updatedPhotos
    }));

    // Save to backend immediately
    try {
      await saveWeddingData({ gallery_photos: updatedPhotos });
      
      // Reset form
      setEditingGalleryPhoto(null);
      setIsAddingNewPhoto(false);
      setFormData(prev => ({
        ...prev,
        gallery_url: '',
        gallery_title: '',
        gallery_category: 'all',
        gallery_description: '',
        gallery_event_message: ''
      }));
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo. Please try again.');
    }
  };

  const handleEditGalleryPhoto = (index) => {
    const photo = localWeddingData.gallery_photos[index];
    setEditingGalleryPhoto(index);
    setIsAddingNewPhoto(false);
    setFormData(prev => ({
      ...prev,
      gallery_url: photo.url || '',
      gallery_title: photo.title || '',
      gallery_category: photo.category || 'all',
      gallery_description: photo.description || '',
      gallery_event_message: photo.eventMessage || ''
    }));
  };

  const handleDeleteGalleryPhoto = async (index) => {
    if (!window.confirm('Are you sure you want to remove this photo?')) return;

    const updatedPhotos = localWeddingData.gallery_photos.filter((_, i) => i !== index);
    
    // Update local state
    setLocalWeddingData(prev => ({
      ...prev,
      gallery_photos: updatedPhotos
    }));

    // Save to backend immediately
    try {
      await saveWeddingData({ gallery_photos: updatedPhotos });
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  // Stable save wrapper that updates local state immediately and backend asynchronously
  // This prevents context updates from causing re-renders while editing
  const handleManagerSave = useCallback(async (data) => {
    try {
      // Update local wedding data immediately without triggering context update
      const updatedData = { ...weddingDataRef.current, ...data };
      weddingDataRef.current = updatedData;
      setLocalWeddingData(updatedData);
      
      // Save to backend asynchronously
      setSaving(true);
      await saveWeddingData(updatedData);
      setSaving(false);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaving(false);
    }
  }, [saveWeddingData]);

  // Memoized onSave callbacks for Manager components
  const handleStoryTimelineSave = useCallback((data) => {
    handleManagerSave({ story_timeline: data.story_timeline });
  }, [handleManagerSave]);

  const handleScheduleSave = useCallback((data) => {
    handleManagerSave(data);
  }, [handleManagerSave]);

  const handleGallerySave = useCallback((data) => {
    handleManagerSave(data);
  }, [handleManagerSave]);

  const handleWeddingPartySave = useCallback((data) => {
    handleManagerSave(data);
  }, [handleManagerSave]);

  const handleRegistrySave = useCallback((data) => {
    handleManagerSave(data);
  }, [handleManagerSave]);

  const renderForm = () => {
    switch (sectionId) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Home Section
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Bride's Name
                </label>
                <input
                  type="text"
                  value={formData.couple_name_1 !== undefined ? formData.couple_name_1 : (localWeddingData.couple_name_1 || '')}
                  onChange={handleCoupleName1Change}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
                  style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                  placeholder="Enter bride's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Groom's Name
                </label>
                <input
                  type="text"
                  value={formData.couple_name_2 !== undefined ? formData.couple_name_2 : (localWeddingData.couple_name_2 || '')}
                  onChange={handleCoupleName2Change}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
                  style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                  placeholder="Enter groom's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.wedding_date !== undefined ? formData.wedding_date : (localWeddingData.wedding_date || '')}
                  onChange={handleWeddingDateChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
                  style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  value={formData.venue_name !== undefined ? formData.venue_name : (localWeddingData.venue_name || '')}
                  onChange={handleVenueNameChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
                  style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                  placeholder="Enter venue name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Venue Location
              </label>
              <input
                type="text"
                value={formData.venue_location !== undefined ? formData.venue_location : (localWeddingData.venue_location || '')}
                onChange={handleVenueLocationChange}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
                style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                placeholder="Enter full venue address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Love Story Description
              </label>
              <textarea
                rows={4}
                value={formData.their_story !== undefined ? formData.their_story : (localWeddingData.their_story || '')}
                onChange={handleTheirStoryChange}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 resize-none backdrop-blur-sm"
                style={{ color: theme.text, borderColor: `${theme.accent}40` }}
                placeholder="Tell your beautiful love story..."
              />
            </div>
          </div>
        );
      
      case 'story':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Our Love Story
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <p className="text-sm mb-4" style={{ color: theme.textLight }}>
              Create a beautiful timeline of your love story. Each stage represents a milestone in your relationship.
            </p>

            {/* Add New Story Stage Button */}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  story_year: new Date().getFullYear().toString(),
                  story_title: '',
                  story_description: '',
                  story_image: '',
                  editing_story_index: -1
                });
              }}
              className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              <Plus className="w-5 h-5" />
              Add New Story Stage
            </button>

            {/* Story Form - Show when adding new or editing */}
            {(formData.story_year !== undefined || formData.story_title !== undefined || formData.editing_story_index !== undefined) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                  {formData.editing_story_index !== undefined && formData.editing_story_index >= 0 ? 'Edit Story Stage' : 'Add New Story Stage'}
                </h4>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Year *
                      </label>
                      <input
                        type="text"
                        value={formData.story_year !== undefined ? formData.story_year : ''}
                        onChange={handleStoryYearChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ color: theme.text }}
                        placeholder="2019"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.story_title !== undefined ? formData.story_title : ''}
                        onChange={handleStoryTitleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ color: theme.text }}
                        placeholder="e.g., First Meeting, Engagement, etc."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Description
                    </label>
                    <textarea
                      value={formData.story_description !== undefined ? formData.story_description : ''}
                      onChange={handleStoryDescriptionChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      style={{ color: theme.text }}
                      rows="3"
                      placeholder="Tell the story of this milestone..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.story_image !== undefined ? formData.story_image : ''}
                      onChange={handleStoryImageChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ color: theme.text }}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs mt-1" style={{ color: theme.textLight }}>
                      Use a direct link to an image (jpg, png, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      // Trigger form submission by calling handleSubmit
                      handleSubmit({ preventDefault: () => {} });
                    }}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Save className="w-4 h-4" />
                    Save Story Stage
                  </button>
                  <button
                    onClick={() => {
                      // Clear form
                      const newFormData = { ...formData };
                      delete newFormData.story_year;
                      delete newFormData.story_title;
                      delete newFormData.story_description;
                      delete newFormData.story_image;
                      delete newFormData.editing_story_index;
                      setFormData(newFormData);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Display existing story timeline with Edit/Delete buttons */}
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
                Story Timeline
              </h4>
              {localWeddingData.story_timeline && localWeddingData.story_timeline.length > 0 ? (
                localWeddingData.story_timeline.map((stage, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-golden text-white px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: theme.primary }}>
                            {stage.year}
                          </span>
                          <h4 className="text-lg font-semibold" style={{ color: theme.text }}>{stage.title}</h4>
                        </div>
                        <p className="text-sm mb-3" style={{ color: theme.textLight }}>{stage.description}</p>
                        
                        {stage.image && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200">
                            <img 
                              src={stage.image} 
                              alt={stage.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            // Load this stage data into form for editing
                            setFormData({
                              ...formData,
                              story_year: stage.year || '',
                              story_title: stage.title || '',
                              story_description: stage.description || '',
                              story_image: stage.image || '',
                              editing_story_index: index
                            });
                          }}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                          title="Edit this story stage"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this story stage?')) {
                              try {
                                // Remove this stage from timeline
                                const updatedTimeline = localWeddingData.story_timeline.filter((_, i) => i !== index);
                                await saveWeddingData({ story_timeline: updatedTimeline });
                                alert('Story stage deleted successfully!');
                              } catch (error) {
                                console.error('Error deleting story stage:', error);
                                alert('Failed to delete story stage. Please try again.');
                              }
                            }
                          }}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                          title="Delete this story stage"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No story stages added yet. Click "Add New Story Stage" to begin.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'schedule':
        // Handle Add New Event
        const handleAddNewEvent = () => {
          setEventFormTitle('');
          setEventFormTime('');
          setEventFormDate(localWeddingData?.wedding_date || '');
          setEventFormDuration('');
          setEventFormLocation('');
          setEventFormDescription('');
          setEventFormHighlight(false);
          setIsAddingNewEvent(true);
          setEditingEventIndex(null);
        };

        // Handle Edit Event
        const handleEditEvent = (event, index) => {
          setEventFormTitle(event.title || '');
          setEventFormTime(event.time || '');
          setEventFormDate(event.date || '');
          setEventFormDuration(event.duration || '');
          setEventFormLocation(event.location || '');
          setEventFormDescription(event.description || '');
          setEventFormHighlight(event.highlight || false);
          setEditingEventIndex(index);
          setIsAddingNewEvent(false);
        };

        // Handle Save Event
        const handleSaveEvent = async () => {
          if (!eventFormTitle.trim() || !eventFormTime.trim()) {
            alert('Please fill in Event Title and Time fields');
            return;
          }

          try {
            const eventData = {
              id: Date.now().toString(),
              title: eventFormTitle.trim(),
              time: eventFormTime.trim(),
              date: eventFormDate,
              duration: eventFormDuration.trim(),
              location: eventFormLocation.trim(),
              description: eventFormDescription.trim(),
              highlight: eventFormHighlight
            };

            let updatedEvents = [...scheduleEvents];
            
            if (isAddingNewEvent) {
              // Add new event
              updatedEvents.push(eventData);
            } else if (editingEventIndex !== null) {
              // Update existing event
              updatedEvents[editingEventIndex] = eventData;
            }

            // Update local state
            setScheduleEvents(updatedEvents);

            // Save to backend
            const updatedData = { ...weddingDataRef.current, schedule_events: updatedEvents };
            await saveWeddingData(updatedData);
            
            // Update local wedding data
            setLocalWeddingData(updatedData);
            weddingDataRef.current = updatedData;

            // Clear form
            setEventFormTitle('');
            setEventFormTime('');
            setEventFormDate('');
            setEventFormDuration('');
            setEventFormLocation('');
            setEventFormDescription('');
            setEventFormHighlight(false);
            setEditingEventIndex(null);
            setIsAddingNewEvent(false);
          } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event: ' + error.message);
          }
        };

        // Handle Cancel
        const handleCancelEvent = () => {
          setEventFormTitle('');
          setEventFormTime('');
          setEventFormDate('');
          setEventFormDuration('');
          setEventFormLocation('');
          setEventFormDescription('');
          setEventFormHighlight(false);
          setEditingEventIndex(null);
          setIsAddingNewEvent(false);
        };

        // Handle Delete Event
        const handleDeleteEvent = async (index) => {
          if (!window.confirm('Are you sure you want to delete this event?')) return;

          try {
            const updatedEvents = scheduleEvents.filter((_, i) => i !== index);
            setScheduleEvents(updatedEvents);

            // Save to backend
            const updatedData = { ...weddingDataRef.current, schedule_events: updatedEvents };
            await saveWeddingData(updatedData);
            
            // Update local wedding data
            setLocalWeddingData(updatedData);
            weddingDataRef.current = updatedData;
          } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event: ' + error.message);
          }
        };
        
        // Important Info handlers
        const defaultInfoItems = [
          { id: 'dress_code', title: 'Dress Code', description: 'Formal/Black Tie Optional. We encourage elegant attire in garden-friendly footwear.' },
          { id: 'weather_plan', title: 'Weather Plan', description: 'Our venue has both indoor and covered outdoor spaces for any weather conditions.' },
          { id: 'transportation', title: 'Transportation', description: 'Complimentary shuttle service available from nearby hotels. Valet parking provided.' },
          { id: 'special_accommodations', title: 'Special Accommodations', description: 'Please let us know of any accessibility needs or dietary restrictions in your RSVP.' }
        ];
        
        const handleAddInfoItem = () => {
          setInfoFormTitle('');
          setInfoFormDescription('');
          setIsAddingInfo(true);
          setEditingInfoItem({ id: Date.now().toString() });
        };
        
        const handleEditInfoItem = (item, itemId) => {
          setInfoFormTitle(item.title || '');
          setInfoFormDescription(item.description || '');
          setEditingInfoItem({ ...item, id: itemId });
          setIsAddingInfo(false);
        };
        
        const handleSaveInfoItem = async () => {
          if (!infoFormTitle.trim()) {
            alert('Please fill in the title field');
            return;
          }
          
          try {
            const updatedInfo = { ...importantInfo };
            updatedInfo[editingInfoItem.id] = {
              title: infoFormTitle.trim(),
              description: infoFormDescription.trim(),
              enabled: true
            };
            
            setImportantInfo(updatedInfo);
            
            // Save to backend
            const updatedData = { ...weddingDataRef.current, important_info: updatedInfo };
            await saveWeddingData(updatedData);
            
            // Update local wedding data
            setLocalWeddingData(updatedData);
            weddingDataRef.current = updatedData;
            
            // Clear form
            setInfoFormTitle('');
            setInfoFormDescription('');
            setEditingInfoItem(null);
            setIsAddingInfo(false);
          } catch (error) {
            console.error('Error saving info:', error);
            alert('Failed to save information: ' + error.message);
          }
        };
        
        const handleCancelInfoItem = () => {
          setInfoFormTitle('');
          setInfoFormDescription('');
          setEditingInfoItem(null);
          setIsAddingInfo(false);
        };
        
        const handleDeleteInfoItem = async (itemId) => {
          if (!window.confirm('Are you sure you want to delete this information?')) return;
          
          try {
            const updatedInfo = { ...importantInfo };
            delete updatedInfo[itemId];
            setImportantInfo(updatedInfo);
            
            // Save to backend
            const updatedData = { ...weddingDataRef.current, important_info: updatedInfo };
            await saveWeddingData(updatedData);
            
            // Update local wedding data
            setLocalWeddingData(updatedData);
            weddingDataRef.current = updatedData;
          } catch (error) {
            console.error('Error deleting info:', error);
            alert('Failed to delete information: ' + error.message);
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Wedding Schedule
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
              Wedding Day Timeline
            </h4>
            <p className="text-sm mb-6" style={{ color: theme.textLight }}>
              Create your wedding day schedule with events, times, and locations. Each card can be edited or removed individually.
            </p>

            {/* Add New Event Button */}
            {!isAddingNewEvent && editingEventIndex === null && (
              <button
                onClick={handleAddNewEvent}
                className="w-full py-3 mb-6 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                <Plus className="w-5 h-5" />
                Add New Event
              </button>
            )}

            {/* Event Form - Shown when adding or editing */}
            {(isAddingNewEvent || editingEventIndex !== null) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                  {isAddingNewEvent ? 'Add New Event' : 'Edit Event'}
                </h4>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Event Time *
                      </label>
                      <input
                        type="text"
                        value={eventFormTime}
                        onChange={(e) => setEventFormTime(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2:00 PM"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Event Title *
                      </label>
                      <input
                        type="text"
                        value={eventFormTitle}
                        onChange={(e) => setEventFormTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Wedding Ceremony, Reception"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Description
                    </label>
                    <textarea
                      value={eventFormDescription}
                      onChange={(e) => setEventFormDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Describe this event..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={eventFormLocation}
                        onChange={(e) => setEventFormLocation(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Main Hall, Garden"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Duration
                      </label>
                      <input
                        type="text"
                        value={eventFormDuration}
                        onChange={(e) => setEventFormDuration(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1 hour, 30 minutes"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventFormDate}
                      onChange={(e) => setEventFormDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                      <input
                        type="checkbox"
                        checked={eventFormHighlight}
                        onChange={(e) => setEventFormHighlight(e.target.checked)}
                        className="rounded"
                        style={{ accentColor: theme.accent }}
                      />
                      Highlight this event (make this stand out in the timeline)
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEvent}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Display existing schedule events */}
            <div className="space-y-4">
              {scheduleEvents.length === 0 && !isAddingNewEvent && editingEventIndex === null ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No events added yet</p>
                </div>
              ) : (
                scheduleEvents.map((event, index) => (
                  // Don't show card if it's currently being edited (form is shown instead)
                  editingEventIndex === index ? null : (
                    <div key={event.id || index} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: event.highlight ? '#FCD34D' : '#e5e7eb' }}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {event.highlight && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
                                Highlighted
                              </span>
                            )}
                            <h4 className="text-lg font-semibold" style={{ color: theme.text }}>{event.title}</h4>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" style={{ color: theme.accent }} />
                              <span style={{ color: theme.textLight }}>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" style={{ color: theme.accent }} />
                              <span style={{ color: theme.textLight }}>{event.date || 'No date set'}</span>
                            </div>
                            {event.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: theme.accent }} />
                                <span style={{ color: theme.textLight }}>Duration: {event.duration}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                                <span style={{ color: theme.textLight }}>{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-sm" style={{ color: theme.textLight }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event, index)}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="Edit this event"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(index)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                            title="Delete this event"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))
              )}
            </div>

            {/* Important Information Section */}
            <div className="pt-6 border-t border-gray-200 mt-8">
              <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                Important Information
              </h4>
              <p className="text-sm mb-6" style={{ color: theme.textLight }}>
                Add important information for your guests like dress code, weather plan, transportation, etc.
              </p>

              {/* Add New Info Button */}
              {!isAddingInfo && !editingInfoItem && (
                <button
                  onClick={handleAddInfoItem}
                  className="w-full py-3 mb-6 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  <Plus className="w-5 h-5" />
                  Add Custom Information
                </button>
              )}

              {/* Info Form - Shown when adding or editing */}
              {(isAddingInfo || editingInfoItem) && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                    {isAddingInfo ? 'Add Custom Information' : 'Edit Information'}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={infoFormTitle}
                        onChange={(e) => setInfoFormTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Parking Information"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Description
                      </label>
                      <textarea
                        value={infoFormDescription}
                        onChange={(e) => setInfoFormDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                        placeholder="Provide details..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveInfoItem}
                      className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelInfoItem}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Important Info Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Default info items */}
                {defaultInfoItems.map((defaultItem) => {
                  const savedItem = importantInfo[defaultItem.id];
                  const item = savedItem || { title: defaultItem.title, description: defaultItem.description };
                  
                  // Don't show if currently being edited
                  if (editingInfoItem && editingInfoItem.id === defaultItem.id) return null;
                  
                  return (
                    <div key={defaultItem.id} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-lg" style={{ color: theme.text }}>{item.title}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditInfoItem(item, defaultItem.id)}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="Edit this information"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: theme.textLight }}>{item.description}</p>
                    </div>
                  );
                })}
                
                {/* Custom info items */}
                {Object.entries(importantInfo).map(([itemId, item]) => {
                  // Skip default items (already shown above)
                  if (defaultInfoItems.find(d => d.id === itemId)) return null;
                  
                  // Don't show if currently being edited
                  if (editingInfoItem && editingInfoItem.id === itemId) return null;
                  
                  return (
                    <div key={itemId} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-lg" style={{ color: theme.text }}>{item.title}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditInfoItem(item, itemId)}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="Edit this information"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteInfoItem(itemId)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                            title="Delete this information"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: theme.textLight }}>{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'rsvp':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit RSVP Section
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <RSVPAdminContent 
              weddingData={localWeddingData} 
              theme={theme} 
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Photo Gallery
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <p className="text-sm mb-4" style={{ color: theme.textLight }}>
              Add photos with URLs and organize them by category. Each photo can have a description and event message that will be displayed in the gallery.
            </p>

            {/* Add New Photo Button */}
            {!editingGalleryPhoto && !isAddingNewPhoto && (
              <button
                onClick={() => {
                  setIsAddingNewPhoto(true);
                  setEditingGalleryPhoto(null);
                  setFormData(prev => ({
                    ...prev,
                    gallery_url: '',
                    gallery_title: '',
                    gallery_category: 'all',
                    gallery_description: '',
                    gallery_event_message: ''
                  }));
                }}
                className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                <Plus className="w-5 h-5" />
                Add New Photo
              </button>
            )}

            {/* Add/Edit Photo Form */}
            {(editingGalleryPhoto !== null || isAddingNewPhoto) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                  {isAddingNewPhoto ? 'Add New Photo' : 'Edit Photo'}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Photo URL (PNG/JPG only) *
                    </label>
                    <input
                      type="url"
                      value={formData.gallery_url !== undefined ? formData.gallery_url : ''}
                      onChange={handleGalleryUrlChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://images.unsplash.com/photo-example.jpg"
                    />
                    <p className="text-xs mt-1" style={{ color: theme.textLight }}>
                      Use a direct link to a PNG or JPG image
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      value={formData.gallery_title !== undefined ? formData.gallery_title : ''}
                      onChange={handleGalleryTitleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Engagement Session, Paris Adventure"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Category Tag *
                    </label>
                    <select
                      value={formData.gallery_category !== undefined ? formData.gallery_category : 'all'}
                      onChange={handleGalleryCategoryChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Photos</option>
                      <option value="engagement">Engagement</option>
                      <option value="travels">Our Travels</option>
                      <option value="family">With Family</option>
                      <option value="friends">With Friends</option>
                    </select>
                    <p className="text-xs mt-1" style={{ color: theme.textLight }}>
                      Choose which section this photo belongs to in the gallery
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Photo Description
                    </label>
                    <textarea
                      value={formData.gallery_description !== undefined ? formData.gallery_description : ''}
                      onChange={handleGalleryDescriptionChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Brief description of the photo..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Event Message
                    </label>
                    <textarea
                      value={formData.gallery_event_message !== undefined ? formData.gallery_event_message : ''}
                      onChange={handleGalleryEventMessageChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="What message do you want to show about this moment/event?"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {formData.gallery_url && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        Preview
                      </label>
                      <img
                        src={formData.gallery_url}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-lg border-2 shadow-md"
                        style={{ borderColor: theme.primary }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="75" viewBox="0 0 100 75"><rect width="100" height="75" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="10">Invalid URL</text></svg>';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveGalleryPhoto}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingGalleryPhoto(null);
                      setIsAddingNewPhoto(false);
                      setFormData(prev => ({
                        ...prev,
                        gallery_url: '',
                        gallery_title: '',
                        gallery_category: 'all',
                        gallery_description: '',
                        gallery_event_message: ''
                      }));
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Display Existing Photos as Cards */}
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold" style={{ color: theme.primary }}>
                Photo Gallery
              </h4>
              {localWeddingData.gallery_photos && localWeddingData.gallery_photos.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {localWeddingData.gallery_photos.map((photo, index) => {
                    const categoryColors = {
                      'all': '#6366F1',
                      'engagement': '#EC4899',
                      'travels': '#10B981',
                      'family': '#F59E0B',
                      'friends': '#8B5CF6'
                    };
                    const categoryNames = {
                      'all': 'All Photos',
                      'engagement': 'Engagement',
                      'travels': 'Our Travels',
                      'family': 'With Family',
                      'friends': 'With Friends'
                    };
                    
                    return (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gray-200">
                          <img 
                            src={photo.url} 
                            alt={photo.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="14">Invalid Image URL</text></svg>';
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-lg flex-1" style={{ color: theme.text }}>{photo.title}</h5>
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium text-white ml-2"
                              style={{ backgroundColor: categoryColors[photo.category] || '#6366F1' }}
                            >
                              {categoryNames[photo.category] || 'All Photos'}
                            </span>
                          </div>
                          
                          {photo.description && (
                            <p className="text-sm mb-2" style={{ color: theme.textLight }}>
                              {photo.description}
                            </p>
                          )}
                          
                          {photo.eventMessage && (
                            <div className="mb-3 p-2 rounded-lg bg-blue-50 border border-blue-200">
                              <p className="text-sm text-blue-800 italic">"{photo.eventMessage}"</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleEditGalleryPhoto(index)}
                              className="flex-1 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-blue-600 text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteGalleryPhoto(index)}
                              className="flex-1 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors text-red-600 text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No photos added yet. Click "Add New Photo" to get started.</p>
                </div>
              )}
            </div>

            {/* Category Legend */}
            {localWeddingData.gallery_photos && localWeddingData.gallery_photos.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium mb-3" style={{ color: theme.text }}>
                  Category Colors:
                </h5>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366F1' }} />
                    <span className="text-xs" style={{ color: theme.textLight }}>All Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EC4899' }} />
                    <span className="text-xs" style={{ color: theme.textLight }}>Engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span className="text-xs" style={{ color: theme.textLight }}>Our Travels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span className="text-xs" style={{ color: theme.textLight }}>With Family</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                    <span className="text-xs" style={{ color: theme.textLight }}>With Friends</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'party':
        // Helper functions for wedding party
        const getCurrentPartyData = () => {
          if (activePartyTab === 'bride') return localWeddingData?.bridal_party || [];
          if (activePartyTab === 'groom') return localWeddingData?.groom_party || [];
          if (activePartyTab === 'special') return localWeddingData?.special_roles || [];
          return [];
        };
        
        const handleAddPartyPerson = () => {
          setPartyPersonName('');
          setPartyPersonRole('');
          setPartyPersonDescription('');
          setPartyPersonPhoto('');
          setEditingPartyPerson({ id: Date.now().toString() });
          setIsAddingPartyPerson(true);
        };
        
        const handleEditPartyPerson = (person) => {
          setPartyPersonName(person.name || '');
          setPartyPersonRole(person.designation || person.role || '');
          setPartyPersonDescription(person.description || '');
          setPartyPersonPhoto(person.photo || person.image || '');
          setEditingPartyPerson(person);
          setIsAddingPartyPerson(false);
        };
        
        const handleSavePartyPerson = async () => {
          if (!partyPersonName.trim() || !partyPersonRole.trim()) {
            alert('Please fill in Name and Role fields');
            return;
          }
          
          const personData = {
            id: editingPartyPerson.id || Date.now().toString(),
            name: partyPersonName.trim(),
            designation: partyPersonRole.trim(),
            role: partyPersonRole.trim(),
            description: partyPersonDescription.trim(),
            photo: partyPersonPhoto.trim(),
            image: partyPersonPhoto.trim()
          };
          
          const currentData = getCurrentPartyData();
          let updatedData;
          
          if (isAddingPartyPerson) {
            updatedData = [...currentData, personData];
          } else {
            updatedData = currentData.map(p => 
              (p.id === editingPartyPerson.id || p.name === editingPartyPerson.name) ? personData : p
            );
          }
          
          // Save to backend
          const saveData = {
            bridal_party: activePartyTab === 'bride' ? updatedData : (localWeddingData?.bridal_party || []),
            groom_party: activePartyTab === 'groom' ? updatedData : (localWeddingData?.groom_party || []),
            special_roles: activePartyTab === 'special' ? updatedData : (localWeddingData?.special_roles || [])
          };
          
          await handleWeddingPartySave(saveData);
          
          // Clear form
          setPartyPersonName('');
          setPartyPersonRole('');
          setPartyPersonDescription('');
          setPartyPersonPhoto('');
          setEditingPartyPerson(null);
          setIsAddingPartyPerson(false);
        };
        
        const handleDeletePartyPerson = async (person) => {
          if (!window.confirm('Are you sure you want to remove this person?')) return;
          
          const currentData = getCurrentPartyData();
          const updatedData = currentData.filter(p => 
            p.id !== person.id && p.name !== person.name
          );
          
          const saveData = {
            bridal_party: activePartyTab === 'bride' ? updatedData : (localWeddingData?.bridal_party || []),
            groom_party: activePartyTab === 'groom' ? updatedData : (localWeddingData?.groom_party || []),
            special_roles: activePartyTab === 'special' ? updatedData : (localWeddingData?.special_roles || [])
          };
          
          await handleWeddingPartySave(saveData);
        };
        
        const handleCancelPartyEdit = () => {
          setPartyPersonName('');
          setPartyPersonRole('');
          setPartyPersonDescription('');
          setPartyPersonPhoto('');
          setEditingPartyPerson(null);
          setIsAddingPartyPerson(false);
        };
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Wedding Party
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSectionEnabled(!sectionEnabled);
                  }}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <p className="text-sm mb-4" style={{ color: theme.textLight }}>
              Introduce your wedding party members - bridesmaids, groomsmen, and more.
            </p>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActivePartyTab('bride')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activePartyTab === 'bride' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                style={{ color: activePartyTab === 'bride' ? theme.primary : theme.textLight }}
              >
                Bride Party
              </button>
              <button
                type="button"
                onClick={() => setActivePartyTab('groom')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activePartyTab === 'groom' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                style={{ color: activePartyTab === 'groom' ? theme.primary : theme.textLight }}
              >
                Groom Party
              </button>
              <button
                type="button"
                onClick={() => setActivePartyTab('special')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activePartyTab === 'special' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                style={{ color: activePartyTab === 'special' ? theme.primary : theme.textLight }}
              >
                Special Roles
              </button>
            </div>

            {/* Add Person Button */}
            {!editingPartyPerson && (
              <button
                type="button"
                onClick={handleAddPartyPerson}
                className="w-full py-3 border-2 border-dashed rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                <Plus className="w-5 h-5" />
                Add Person to {activePartyTab === 'bride' ? 'Bride Party' : activePartyTab === 'groom' ? 'Groom Party' : 'Special Roles'}
              </button>
            )}

            {/* Add/Edit Form */}
            {editingPartyPerson && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
                  {isAddingPartyPerson ? 'Add New Person' : 'Edit Person'}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={partyPersonName}
                      onChange={(e) => setPartyPersonName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Role/Title *
                    </label>
                    <input
                      type="text"
                      value={partyPersonRole}
                      onChange={(e) => setPartyPersonRole(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Maid of Honor, Best Man, Flower Girl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Relationship/Description
                    </label>
                    <textarea
                      value={partyPersonDescription}
                      onChange={(e) => setPartyPersonDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="e.g., Best friend since college, Sister, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Photo URL
                    </label>
                    <input
                      type="url"
                      value={partyPersonPhoto}
                      onChange={(e) => setPartyPersonPhoto(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs mt-1" style={{ color: theme.textLight }}>
                      Use a direct link to an image (jpg, png, etc.)
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSavePartyPerson}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPartyEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* People Cards */}
            <div className="space-y-4">
              {getCurrentPartyData().length === 0 && !editingPartyPerson ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No people added to {activePartyTab === 'bride' ? 'Bride Party' : activePartyTab === 'groom' ? 'Groom Party' : 'Special Roles'} yet</p>
                </div>
              ) : (
                getCurrentPartyData().map((person, index) => (
                  <div key={person.id || index} className="bg-white rounded-lg shadow-md p-4 flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {(person.photo || person.image) ? (
                        <img src={person.photo || person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg" style={{ color: theme.text }}>{person.name}</h4>
                      <p className="font-medium" style={{ color: theme.primary }}>{person.designation || person.role}</p>
                      <p className="text-sm mt-1" style={{ color: theme.textLight }}>{person.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPartyPerson(person)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePartyPerson(person)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'registry':
        return (
          <RegistryManager 
            weddingData={weddingData} 
            onSave={handleRegistrySave} 
            theme={theme} 
          />
        );

      case 'guestbook':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit Guest Book
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: theme.gradientAccent }}
              >
                <MessageCircle className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <p className="text-lg mb-2" style={{ color: theme.text }}>
                Guest Book Messages
              </p>
              <p className="text-sm" style={{ color: theme.textLight }}>
                Configure the guest book section where friends and family can leave heartfelt messages and well wishes.
              </p>
            </div>
          </div>
        );

      case 'faq':
        return (
          <FAQAdmin 
            weddingData={localWeddingData} 
            onSave={saveWeddingData} 
            theme={theme} 
          />
        );

      case 'theme':
        return (
          <ThemeManager 
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            themes={themes}
            onSave={saveWeddingData}
            theme={theme}
          />
        );

      case 'ai-design':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              AI Design Generator
            </h3>
            <div className="text-center py-12">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: theme.gradientAccent }}
              >
                <Wand2 className="w-10 h-10" style={{ color: theme.primary }} />
              </div>
              <p className="text-lg mb-4" style={{ color: theme.text }}>
                AI-Powered Design Coming Soon!
              </p>
              <p className="text-sm mb-6" style={{ color: theme.textLight }}>
                Our AI will generate beautiful, personalized wedding card designs based on your preferences, theme, and story.
              </p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-left">
                <h4 className="font-semibold mb-3 text-purple-800">Features will include:</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>• Color scheme suggestions based on your theme</li>
                  <li>• Layout optimization for your content</li>
                  <li>• Font pairing recommendations</li>
                  <li>• Background pattern generation</li>
                  <li>• Multiple design variations to choose from</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'custom-url':
        return <CustomUrlForm theme={theme} weddingData={localWeddingData} saveWeddingData={saveWeddingData} />;

      case 'qrcode-generator':
        return (
          <QRCodeGenerator 
            weddingData={localWeddingData} 
            theme={theme} 
            onClose={() => setActiveForm(null)} 
          />
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
                Edit {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: theme.textLight }}>Enable Section</span>
                <button
                  onClick={() => setSectionEnabled(!sectionEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    sectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    sectionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: theme.gradientAccent }}
              >
                <Plus className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <p className="text-lg mb-2" style={{ color: theme.text }}>
                Enhanced form for {sectionId} section
              </p>
              <p className="text-sm" style={{ color: theme.textLight }}>
                This section will contain pre-populated data from your landing page. You can edit, replace, or remove any content here.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="modal-content bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border"
        style={{ 
          border: `1px solid ${theme.accent}30`,
          background: `linear-gradient(135deg, ${theme.background}f8, ${theme.secondary}f0)`
        }}
      >
        <div className="p-8">
          {/* Header with auto-save indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {saving && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}
            </div>
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
            
            <div className="flex justify-between items-center mt-8">
              <div className="text-sm opacity-70" style={{ color: theme.textLight }}>
                💡 Click "Save Changes" to save your data. Use Cancel or ESC to close without saving.
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  style={{ color: theme.text }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  style={{
                    background: theme.gradientAccent,
                    color: theme.primary
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if these props actually change
  return (
    prevProps.sectionId === nextProps.sectionId &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.theme === nextProps.theme &&
    prevProps.modalRef === nextProps.modalRef
  );
});

// Custom URL Form Component
const CustomUrlForm = ({ theme, weddingData, saveWeddingData }) => {
  const { userInfo } = useUserData();
  const [customUrl, setCustomUrl] = useState(weddingData.custom_url || '');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (customUrl) {
      setPreviewUrl(`${window.location.origin}/${customUrl}`);
    } else {
      setPreviewUrl(`${window.location.origin}/wedding/${userInfo.userId}`);
    }
  }, [customUrl, userInfo.userId]);

  const handleSaveUrl = () => {
    const updatedData = { ...weddingData, custom_url: customUrl };
    saveWeddingData(updatedData);
  };

  const handleCopyUrl = () => {
    copyToClipboardWithFallback(previewUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch((error) => {
      console.error('Failed to copy URL:', error);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const generateSuggestions = () => {
    const name1 = weddingData.couple_name_1?.toLowerCase().replace(/\s+/g, '') || 'bride';
    const name2 = weddingData.couple_name_2?.toLowerCase().replace(/\s+/g, '') || 'groom';
    return [
      `${name1}-${name2}-wedding`,
      `${name1}and${name2}`,
      `${name1}-${name2}-2025`,
      `wedding-${name1}-${name2}`,
      `${name1}${name2}wedding`
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          Customize Your Wedding URL
        </h3>
        <div className="flex items-center gap-2">
          <Link className="w-6 h-6" style={{ color: theme.accent }} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <h4 className="font-semibold mb-3 text-blue-800">Create Your Perfect Wedding URL</h4>
        <p className="text-sm text-blue-700 mb-4">
          Make your wedding card easy to remember and share with a custom URL that reflects your love story.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Custom URL Route
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm px-3 py-3 bg-gray-100 rounded-l-xl border-r-0" style={{ color: theme.textLight }}>
              {window.location.origin}/
            </span>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setCustomUrl(value);
              }}
              className="flex-1 px-4 py-3 rounded-r-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 backdrop-blur-sm"
              style={{ color: theme.text, borderColor: `${theme.accent}40` }}
              placeholder="sarah-michael-wedding"
            />
          </div>
          <p className="text-xs mt-1" style={{ color: theme.textLight }}>
            Only lowercase letters, numbers, and hyphens allowed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            Preview URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={previewUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-200"
              style={{ color: theme.text }}
            />
            <button
              onClick={handleCopyUrl}
              className="px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: isCopied ? '#10b981' : theme.gradientAccent,
                color: theme.primary
              }}
            >
              {isCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: theme.text }}>
            URL Suggestions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {generateSuggestions().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setCustomUrl(suggestion)}
                className="text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm"
                style={{ color: theme.textLight }}
              >
                {window.location.origin}/{suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveUrl}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme.gradientAccent,
              color: theme.primary
            }}
          >
            Save Custom URL
          </button>
        </div>
      </div>
    </div>
  );
};

// QR Code Generator Form - Replaced with new QRCodeGenerator component

export default LeftSidebar;