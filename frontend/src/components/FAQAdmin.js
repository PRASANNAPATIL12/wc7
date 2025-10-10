import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  HelpCircle,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';

const FAQAdmin = ({ weddingData, onSave, theme }) => {
  const [faqs, setFaqs] = useState(weddingData?.faqs || []);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with default FAQs if none exist
  useEffect(() => {
    if (!weddingData?.faqs || weddingData.faqs.length === 0) {
      const defaultFaqs = [
        {
          id: 'default-1',
          question: "What should I wear?",
          answer: "We're having a garden ceremony, so we recommend cocktail attire. Ladies, consider comfortable shoes for outdoor surfaces."
        },
        {
          id: 'default-2', 
          question: "Will there be parking available?",
          answer: "Yes, there is complimentary valet parking available at the venue entrance."
        },
        {
          id: 'default-3',
          question: "Can I bring a guest?",
          answer: "Please check your invitation for guest details. If you have any questions, feel free to reach out to us directly."
        },
        {
          id: 'default-4',
          question: "Is the venue accessible?",
          answer: "Yes, our venue is fully wheelchair accessible with ramps and accessible restroom facilities."
        }
      ];
      setFaqs(defaultFaqs);
      // Auto-save default FAQs
      handleSaveToBackend(defaultFaqs);
    } else {
      setFaqs(weddingData.faqs);
    }
  }, [weddingData]);

  const handleAddFaq = () => {
    const newFaq = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setEditingFaq(newFaq);
    setIsAddingNew(true);
    setExpandedCard(newFaq.id);
  };

  const handleEditFaq = (faq) => {
    setEditingFaq({ ...faq });
    setIsAddingNew(false);
    setExpandedCard(faq.id);
  };

  const handleSaveFaq = () => {
    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      alert('Please fill in both question and answer fields');
      return;
    }

    let updatedFaqs;
    
    if (isAddingNew) {
      updatedFaqs = [...faqs, editingFaq];
    } else {
      updatedFaqs = faqs.map(faq => 
        faq.id === editingFaq.id ? editingFaq : faq
      );
    }

    setFaqs(updatedFaqs);
    setEditingFaq(null);
    setIsAddingNew(false);
    setExpandedCard(null);
    setHasChanges(true);
    
    // Save to backend immediately
    handleSaveToBackend(updatedFaqs);
  };

  const handleDeleteFaq = (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    const updatedFaqs = faqs.filter(faq => faq.id !== faqId);
    setFaqs(updatedFaqs);
    setHasChanges(true);
    
    // If we're editing the deleted FAQ, clear the editing state
    if (editingFaq && editingFaq.id === faqId) {
      setEditingFaq(null);
      setIsAddingNew(false);
      setExpandedCard(null);
    }
    
    // Save to backend immediately
    handleSaveToBackend(updatedFaqs);
  };

  const handleCancelEdit = () => {
    setEditingFaq(null);
    setIsAddingNew(false);
    setExpandedCard(null);
  };

  const handleSaveToBackend = async (faqsToSave) => {
    try {
      console.log('💾 FAQ Admin: Saving FAQs to backend...', faqsToSave);
      
      // Call the parent's onSave function which will update the full wedding document
      // This is the same pattern used by OurStory, Gallery, and other sections
      await onSave({ faqs: faqsToSave });
      
      console.log('✅ FAQ Admin: FAQs saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('❌ FAQ Admin: Error saving FAQs:', error);
      alert('Failed to save FAQs. Please try again.');
    }
  };

  const toggleCard = (faqId) => {
    if (editingFaq && editingFaq.id === faqId) {
      // If currently editing this card, don't collapse
      return;
    }
    setExpandedCard(expandedCard === faqId ? null : faqId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.primary }}>
            FAQ Management
          </h3>
          <p className="text-sm" style={{ color: theme.textLight }}>
            Manage frequently asked questions for your wedding guests.
          </p>
        </div>
        
        {/* Enable Section Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            Enable Section
          </span>
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
              faqs.length > 0 ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform duration-200 bg-white rounded-full ${
                faqs.length > 0 ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Add New FAQ Button */}
      {!editingFaq && (
        <button
          onClick={handleAddFaq}
          className="w-full py-3 border-2 border-dashed rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          style={{ borderColor: theme.primary, color: theme.primary }}
        >
          <Plus className="w-5 h-5" />
          Add New FAQ
        </button>
      )}

      {/* Add/Edit Form - Shows above cards when adding new or editing */}
      {editingFaq && isAddingNew && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-blue-900">Add New FAQ</h4>
            <button
              onClick={handleCancelEdit}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-900">
                Question *
              </label>
              <input
                type="text"
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your question..."
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-900">
                Answer *
              </label>
              <textarea
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows="4"
                placeholder="Enter the answer..."
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveFaq}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.primary }}
              >
                <Save className="w-4 h-4" />
                Save FAQ
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Cards */}
      <div className="space-y-4 max-h-96 overflow-y-auto">{!isAddingNew && faqs.length > 0 && <p className="text-sm text-gray-500 mb-2">Click on any question to view/edit the answer</p>}
        {faqs.map((faq) => {
          const isExpanded = expandedCard === faq.id;
          const isEditing = editingFaq && editingFaq.id === faq.id;
          
          return (
            <div 
              key={faq.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Card Header */}
              <div 
                className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isExpanded ? 'bg-gray-50' : ''
                }`}
                onClick={() => !isEditing && toggleCard(faq.id)}
              >
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: theme.accent }} />
                    <span 
                      className="font-medium text-sm sm:text-base break-words"
                      style={{ color: theme.text }}
                    >
                      {faq.question || 'New Question'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {!isEditing && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFaq(faq);
                          }}
                          className="p-1.5 sm:p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFaq(faq.id);
                          }}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        </button>
                      </>
                    )}
                    
                    {!isEditing && (
                      isExpanded ? 
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.accent }} /> :
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.accent }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content - Smooth Accordion Animation */}
              <div 
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ 
                  maxHeight: isExpanded ? (isEditing ? '1000px' : '500px') : '0',
                  opacity: isExpanded ? 1 : 0,
                  paddingTop: isExpanded ? '0' : '0',
                  paddingBottom: isExpanded ? '0' : '0'
                }}
              >
                <div className="border-t border-gray-200">
                  {isEditing ? (
                    // Edit Form
                    <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Question *
                        </label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                          placeholder="Enter your question..."
                          autoFocus
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Answer *
                        </label>
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                          rows="5"
                          placeholder="Enter the answer..."
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                        <button
                          onClick={handleSaveFaq}
                          className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Answer
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                          style={{ backgroundColor: `${theme.accent}20` }}
                        >
                          <span style={{ color: theme.accent }}>A</span>
                        </div>
                        <div className="flex-1">
                          <p 
                            className="text-sm sm:text-base leading-relaxed"
                            style={{ color: theme.text }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {faqs.length === 0 && !editingFaq && (
        <div className="text-center py-8">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No FAQs added yet</p>
        </div>
      )}
    </div>
  );
};

export default FAQAdmin;