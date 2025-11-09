import { useState } from 'react';
import type { Beam } from '../types/beam';
import { TEMPLATES, getCategories } from '../lib/templates/library';
import type { BeamTemplate } from '../lib/templates/types';

interface TemplateSelectorProps {
  onSelectTemplate: (beam: Beam) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Simply Supported');

  const categories = getCategories();
  const filteredTemplates = TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: BeamTemplate) => {
    onSelectTemplate(template.beam);
    setIsOpen(false);
  };

  const getLoadDescription = (template: BeamTemplate): string => {
    const loadCount = template.beam.loads.length;
    const loadTypes = template.beam.loads.map(l => l.type);
    const hasPoint = loadTypes.includes('point');
    const hasDistributed = loadTypes.includes('distributed');

    if (hasPoint && hasDistributed) {
      return 'Combined loading';
    } else if (hasPoint) {
      return `${loadCount} point load${loadCount > 1 ? 's' : ''}`;
    } else if (hasDistributed) {
      return `${loadCount} distributed load${loadCount > 1 ? 's' : ''}`;
    }
    return 'No loads';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <span>Load Template</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Beam Templates</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start with a common beam configuration
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mt-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-white text-purple-700 shadow-md'
                        : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-200 text-left group"
                  >
                    {/* Template Icon/Visual */}
                    <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors">
                      {template.category === 'Cantilever' ? (
                        <svg width="80" height="50" viewBox="0 0 80 50" className="text-purple-700">
                          {/* Fixed support */}
                          <rect x="5" y="10" width="3" height="30" fill="currentColor" />
                          <line x1="5" y1="12" x2="2" y2="15" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="5" y1="18" x2="2" y2="21" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="5" y1="24" x2="2" y2="27" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="5" y1="30" x2="2" y2="33" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="5" y1="36" x2="2" y2="39" stroke="currentColor" strokeWidth="1.5" />
                          {/* Beam */}
                          <line x1="8" y1="25" x2="70" y2="25" stroke="currentColor" strokeWidth="2.5" />
                          {/* Load arrow */}
                          <line x1="50" y1="10" x2="50" y2="22" stroke="#ef4444" strokeWidth="2" />
                          <polygon points="50,22 47,18 53,18" fill="#ef4444" />
                        </svg>
                      ) : (
                        <svg width="80" height="50" viewBox="0 0 80 50" className="text-purple-700">
                          {/* Pin support */}
                          <circle cx="10" cy="28" r="3" fill="currentColor" />
                          <line x1="10" y1="31" x2="7" y2="36" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="10" y1="31" x2="13" y2="36" stroke="currentColor" strokeWidth="1.5" />
                          {/* Roller support */}
                          <circle cx="70" cy="28" r="3" fill="currentColor" />
                          <circle cx="67" cy="33" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="73" cy="33" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="64" y1="36" x2="76" y2="36" stroke="currentColor" strokeWidth="1.5" />
                          {/* Beam */}
                          <line x1="10" y1="25" x2="70" y2="25" stroke="currentColor" strokeWidth="2.5" />
                          {/* Load arrow */}
                          <line x1="40" y1="10" x2="40" y2="22" stroke="#ef4444" strokeWidth="2" />
                          <polygon points="40,22 37,18 43,18" fill="#ef4444" />
                        </svg>
                      )}
                    </div>

                    {/* Template Info */}
                    <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Template Details */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                        L = {template.beam.length} {template.beam.units === 'metric' ? 'm' : 'ft'}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                        {getLoadDescription(template)}
                      </span>
                      {template.expectedResults && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold">
                          M<sub>max</sub> ≈ {template.expectedResults.maxMoment.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
                  <p className="mt-1 text-sm text-gray-500">No templates available in this category.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                💡 Tip: Templates provide a starting point. You can modify values after loading.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
