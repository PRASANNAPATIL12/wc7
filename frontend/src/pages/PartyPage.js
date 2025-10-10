import React from 'react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import { Heart, Star, Crown, Users } from 'lucide-react';

const PartyPage = () => {
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];
  const { weddingData } = useUserData();

  // Use ONLY real data from MongoDB - no fallback defaults
  // This ensures the page shows exactly what the owner has added in the dashboard
  const brideParty = weddingData?.bridal_party || [];
  const groomParty = weddingData?.groom_party || [];
  const specialRoles = weddingData?.special_roles || [];

  const PartyMember = ({ member, isSpecial = false }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl text-center">
      <div className="relative mb-6">
        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-white/30">
          <img
            src={member.image || member.photo || 'https://via.placeholder.com/400x400?text=No+Photo'}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=' + (member.name?.charAt(0) || '?');
            }}
          />
        </div>
        <div 
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: theme.gradientAccent }}
        >
          {member.role === 'Maid of Honor' || member.role === 'Best Man' ? (
            <Crown className="w-6 h-6" style={{ color: theme.primary }} />
          ) : isSpecial ? (
            <Star className="w-6 h-6" style={{ color: theme.primary }} />
          ) : (
            <Heart className="w-6 h-6" style={{ color: theme.primary }} />
          )}
        </div>
      </div>
      
      <h3 
        className="text-2xl font-semibold mb-2"
        style={{ 
          fontFamily: theme.fontPrimary,
          color: theme.primary 
        }}
      >
        {member.name}
      </h3>
      
      <div 
        className="text-lg font-medium mb-2"
        style={{ color: theme.accent }}
      >
        {member.role || member.designation}
      </div>
      
      <div 
        className="text-sm font-medium mb-4 opacity-80"
        style={{ color: theme.text }}
      >
        {member.relationship} {member.age && `• ${member.age}`}
      </div>
      
      <p 
        className="text-sm leading-relaxed"
        style={{ color: theme.textLight }}
      >
        {member.description}
      </p>
    </div>
  );

  return (
    <div 
      className="min-h-screen pt-16 pb-16 px-8"
      style={{ background: theme.gradientPrimary }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 
            className="text-6xl font-light mb-6"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            Wedding Party
          </h1>
          <div 
            className="w-24 h-0.5 mx-auto mb-8"
            style={{ background: theme.accent }}
          />
          <p 
            className="text-xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: theme.textLight }}
          >
            We're surrounded by the most amazing family and friends who have supported our journey. 
            Meet the special people who will be standing with us on our big day!
          </p>
        </div>

        {/* Bride's Party */}
        {brideParty.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-4">
                <Heart className="w-8 h-8" style={{ color: theme.accent }} />
                <h2 
                  className="text-4xl font-light"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  Bride's Party
                </h2>
                <Heart className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: theme.textLight }}
              >
                The wonderful women who have shaped Sarah's life and will stand by her side as she says "I do."
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {brideParty.map((member, index) => (
                <PartyMember key={member.id || index} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Groom's Party */}
        {groomParty.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-4">
                <Users className="w-8 h-8" style={{ color: theme.accent }} />
                <h2 
                  className="text-4xl font-light"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  Groom's Party
                </h2>
                <Users className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: theme.textLight }}
              >
                The incredible men who have been Michael's support system and will stand proudly beside him on this momentous day.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {groomParty.map((member, index) => (
                <PartyMember key={member.id || index} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Special Roles */}
        {specialRoles.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-4">
                <Star className="w-8 h-8" style={{ color: theme.accent }} />
                <h2 
                  className="text-4xl font-light"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  Special Roles
                </h2>
                <Star className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: theme.textLight }}
              >
                Our precious little ones who will add extra magic and joy to our ceremony.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {specialRoles.map((member, index) => (
                <PartyMember key={member.id || index} member={member} isSpecial={true} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PartyPage;