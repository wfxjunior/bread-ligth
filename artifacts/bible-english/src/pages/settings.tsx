import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Settings2, Monitor, Type, Volume2, Globe } from 'lucide-react';

const THEMES = [
  { id: 'classic', name: 'Classic Parchment', desc: 'Warm, easy on the eyes' },
  { id: 'oxford', name: 'Oxford Paper', desc: 'Crisp white, high contrast' },
  { id: 'scholar', name: 'Scholar', desc: 'Muted tones, focused' },
  { id: 'night', name: 'Night Study', desc: 'Dark mode for evening' },
  { id: 'notebook', name: 'Study Notebook', desc: 'Ruled lines, casual' },
];

export default function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [level, setLevel] = useState('Intermediate');
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-10">
          <h1 className="font-serif text-4xl text-primary mb-2 flex items-center gap-3">
            <Settings2 className="w-8 h-8" /> Settings
          </h1>
          <p className="text-muted-foreground font-medium">Customize your reading and learning experience</p>
        </header>

        <div className="space-y-12">
          
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Monitor className="w-4 h-4" /> Reading Theme
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${
                    selectedTheme === theme.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`w-full h-20 rounded-md mb-3 border border-border/50 ${
                    theme.id === 'classic' ? 'bg-[#fbf9f6]' :
                    theme.id === 'oxford' ? 'bg-white' :
                    theme.id === 'scholar' ? 'bg-slate-50' :
                    theme.id === 'night' ? 'bg-slate-900' :
                    'bg-[#fdfaf5]' // notebook
                  }`}>
                    {/* Visual hint of the theme */}
                    <div className="p-2 space-y-1.5 opacity-50">
                      <div className={`w-3/4 h-1.5 rounded-full ${theme.id === 'night' ? 'bg-white/20' : 'bg-black/20'}`} />
                      <div className={`w-full h-1.5 rounded-full ${theme.id === 'night' ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div className={`w-5/6 h-1.5 rounded-full ${theme.id === 'night' ? 'bg-white/10' : 'bg-black/10'}`} />
                    </div>
                  </div>
                  <h4 className="font-serif font-medium text-foreground">{theme.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{theme.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Type className="w-4 h-4" /> Typography
            </h3>
            <div className="bg-card border border-border p-6 rounded-xl space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium text-foreground mb-3">
                  <span>Font Size</span>
                  <span className="text-muted-foreground">Medium</span>
                </label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-primary" />
              </div>
              
              <div>
                <label className="flex justify-between text-sm font-medium text-foreground mb-3">
                  <span>Line Height</span>
                  <span className="text-muted-foreground">Relaxed</span>
                </label>
                <input type="range" min="1" max="3" defaultValue="2" className="w-full accent-primary" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Globe className="w-4 h-4" /> Language Learning
            </h3>
            <div className="bg-card border border-border p-6 rounded-xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">English Proficiency Level</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        level === l
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Controls the complexity of grammar explanations and the amount of vocabulary highlighted automatically.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <Volume2 className="w-4 h-4" /> Audio
            </h3>
            <div className="bg-card border border-border p-6 rounded-xl">
              <label className="flex justify-between text-sm font-medium text-foreground mb-3">
                <span>Playback Speed</span>
                <span className="text-muted-foreground">0.8x (Slower)</span>
              </label>
              <input type="range" min="5" max="15" defaultValue="8" className="w-full accent-primary" />
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
