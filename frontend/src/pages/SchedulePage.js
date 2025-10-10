import React from 'react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import { Clock, MapPin, Users, Music, Camera, Utensils, Calendar } from 'lucide-react';

const SchedulePage = () => {
  const { themes, currentTheme } = useAppTheme();
  const { weddingData } = useUserData();
  const theme = themes[currentTheme];

  // Get dynamic schedule events from wedding data, with fallback to default
  const events = weddingData?.schedule_events && weddingData.schedule_events.length > 0 
    ? weddingData.schedule_events 
    : [
        {
          time: "2:00 PM",
          title: "Guests Arrival & Welcome",
          description: "Please arrive by 2:00 PM for welcome drinks and mingling before the ceremony begins.",
          location: "Sunset Garden Estate - Main Entrance",
          duration: "30 minutes",
          highlight: false
        },
        {
          time: "3:00 PM",
          title: "Wedding Ceremony",
          description: "The main event! Exchange vows in our beautiful garden setting.",
          location: "Sunset Garden Estate - Ceremony Garden",
          duration: "45 minutes",
          highlight: true
        },
        {
          time: "5:00 PM",
          title: "Reception Dinner",
          description: "Join us for a wonderful dinner featuring locally sourced ingredients.",
          location: "Grand Ballroom",
          duration: "2 hours",
          highlight: false
        }
      ];

  // Get dynamic important info from wedding data, with fallback to default
  const importantInfo = weddingData?.important_info && weddingData.important_info.length > 0
    ? weddingData.important_info
    : [
        {
          title: "Dress Code",
          description: "Formal/Black Tie Optional. We encourage elegant attire in garden-friendly footwear."
        },
        {
          title: "Weather Plan",
          description: "Our venue has both indoor and covered outdoor spaces for any weather conditions."
        },
        {
          title: "Transportation",
          description: "Complimentary shuttle service available from nearby hotels. Valet parking provided."
        },
        {
          title: "Special Accommodations",
          description: "Please let us know of any accessibility needs or dietary restrictions in your RSVP."
        }
      ];

  // Map icon names to icon components
  const getIcon = (iconName) => {
    const iconMap = {
      'Users': Users,
      'Calendar': Calendar,
      'Music': Music,
      'Camera': Camera,
      'Utensils': Utensils,
      'Clock': Clock,
      'MapPin': MapPin
    };
    return iconMap[iconName] || Calendar;
  };

  return (
    <div 
      className="min-h-screen pt-16 pb-16 px-8"
      style={{ background: theme.gradientPrimary }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-6xl font-light mb-6"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            Wedding Schedule
          </h1>
          <div 
            className="w-24 h-0.5 mx-auto mb-8"
            style={{ background: theme.accent }}
          />
          <p 
            className="text-xl leading-relaxed max-w-3xl mx-auto mb-8"
            style={{ color: theme.textLight }}
          >
            Here's everything you need to know about our special day. We can't wait to celebrate with you!
          </p>
          
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Calendar className="w-5 h-5" style={{ color: theme.accent }} />
            <span className="font-semibold" style={{ color: theme.text }}>
              Saturday, June 15, 2025
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mb-20">
          {/* Timeline line */}
          <div 
            className="absolute left-8 md:left-20 top-0 bottom-0 w-1 hidden sm:block"
            style={{ background: `linear-gradient(to bottom, ${theme.accent}, transparent)` }}
          />

          <div className="space-y-8">
            {events.map((event, index) => {
              // Get icon - if event.icon is string, map it; if it's already a component, use it
              const Icon = typeof event.icon === 'string' ? getIcon(event.icon) : (event.icon || Calendar);
              return (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-16 w-8 h-8 rounded-full border-4 border-white hidden sm:flex items-center justify-center"
                    style={{ 
                      background: event.highlight ? theme.accent : theme.secondary,
                      borderColor: event.highlight ? theme.accent : theme.accent + '40'
                    }}
                  >
                    {event.highlight && <span className="w-3 h-3 rounded-full bg-white"></span>}
                  </div>

                  {/* Event card */}
                  <div className="ml-0 sm:ml-32">
                    <div 
                      className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                        event.highlight ? 'ring-2' : ''
                      }`}
                      style={{ 
                        ringColor: event.highlight ? theme.accent : 'transparent'
                      }}
                    >
                      <div className="flex items-start gap-6">
                        <div 
                          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: theme.gradientAccent }}
                        >
                          <Icon className="w-8 h-8" style={{ color: theme.primary }} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h3 
                              className="text-2xl font-semibold mb-2 sm:mb-0"
                              style={{ 
                                fontFamily: theme.fontPrimary,
                                color: theme.primary 
                              }}
                            >
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: theme.accent }} />
                                <span style={{ color: theme.text }}>{event.time}</span>
                              </div>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  background: theme.accent + '20',
                                  color: theme.accent 
                                }}
                              >
                                {event.duration}
                              </span>
                            </div>
                          </div>
                          
                          <p 
                            className="text-lg leading-relaxed mb-4"
                            style={{ color: theme.textLight }}
                          >
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                            <span 
                              className="font-medium"
                              style={{ color: theme.text }}
                            >
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Information */}
        <div>
          <h2 
            className="text-4xl font-light text-center mb-12"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            Important Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {importantInfo.map((info, index) => {
              // Get icon - if info.icon is string, map it; if it's already a component, use it
              const Icon = typeof info.icon === 'string' ? getIcon(info.icon) : (info.icon || Users);
              return (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: theme.gradientAccent }}
                    >
                      <Icon className="w-6 h-6" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h3 
                        className="text-xl font-semibold mb-3"
                        style={{ 
                          fontFamily: theme.fontPrimary,
                          color: theme.primary 
                        }}
                      >
                        {info.title}
                      </h3>
                      <p 
                        className="leading-relaxed"
                        style={{ color: theme.textLight }}
                      >
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;