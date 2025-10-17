import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, set } from 'firebase/database';

const DatabaseEditor = () => {
  const [jsonData, setJsonData] = useState('');
  const [originalData, setOriginalData] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Find and Replace state
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [textareaRef, setTextareaRef] = useState(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      const snapshot = await get(ref(database));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedJson = JSON.stringify(data, null, 2);
        setJsonData(formattedJson);
        setOriginalData(formattedJson);
        setHasChanges(false);
        setMessage('✅ Database loaded successfully!');
      } else {
        setJsonData('{}');
        setOriginalData('{}');
        setMessage('⚠️ Database is empty. You can add data by editing the JSON below.');
      }
    } catch (error) {
      console.error('Error fetching database:', error);
      setMessage('❌ Error loading database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonChange = (e) => {
    const newValue = e.target.value;
    setJsonData(newValue);
    setHasChanges(newValue !== originalData);
    
    // Validate JSON
    try {
      JSON.parse(newValue);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const saveToFirebase = async () => {
    if (!isValidJson) {
      setMessage('❌ Cannot save: JSON is invalid. Please fix syntax errors first.');
      return;
    }

    try {
      setSaving(true);
      const parsedData = JSON.parse(jsonData);
      
      // Save to Firebase root
      await set(ref(database), parsedData);
      
      setOriginalData(jsonData);
      setHasChanges(false);
      setMessage('✅ Database updated successfully!');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setMessage('❌ Error saving to database. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setJsonData(originalData);
    setHasChanges(false);
    setIsValidJson(true);
    setMessage('🔄 Changes reset to original data.');
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonData(formatted);
      setMessage('✨ JSON formatted successfully!');
    } catch (error) {
      setMessage('❌ Cannot format: Invalid JSON syntax.');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const minified = JSON.stringify(parsed);
      setJsonData(minified);
      setMessage('📦 JSON minified successfully!');
    } catch (error) {
      setMessage('❌ Cannot minify: Invalid JSON syntax.');
    }
  };

  // Find and Replace functions
  const toggleFindReplace = () => {
    setShowFindReplace(!showFindReplace);
    if (!showFindReplace) {
      setFindText('');
      setReplaceText('');
      setCurrentMatchIndex(0);
      setTotalMatches(0);
    }
  };

  // Count total matches and update state
  const countMatches = (text, searchText) => {
    if (!searchText) return 0;
    const matches = text.split(searchText).length - 1;
    return matches;
  };

  // Find all match positions
  const findAllMatches = (text, searchText) => {
    const positions = [];
    let index = 0;
    while ((index = text.indexOf(searchText, index)) !== -1) {
      positions.push(index);
      index += searchText.length;
    }
    return positions;
  };

  // Create highlighted HTML for background layer
  const createHighlightedHtml = (text, searchText, currentIndex) => {
    if (!searchText || !text) return text;
    
    const matches = findAllMatches(text, searchText);
    if (matches.length === 0) return text;
    
    let result = '';
    let lastIndex = 0;
    
    matches.forEach((matchPos, idx) => {
      // Add text before match
      result += escapeHtml(text.substring(lastIndex, matchPos));
      
      // Add highlighted match
      const isCurrentMatch = idx === currentIndex - 1;
      const highlightClass = isCurrentMatch ? 'current-match' : 'other-match';
      result += `<mark class="${highlightClass}">${escapeHtml(text.substring(matchPos, matchPos + searchText.length))}</mark>`;
      
      lastIndex = matchPos + searchText.length;
    });
    
    // Add remaining text
    result += escapeHtml(text.substring(lastIndex));
    return result;
  };

  // Escape HTML for safe rendering
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
      .replace(/ /g, '&nbsp;');
  };

  // Scroll textarea to show the selected text
  const scrollToSelection = (textarea, selectionStart) => {
    // Get textarea dimensions
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const textBeforeSelection = textarea.value.substring(0, selectionStart);
    const linesBeforeSelection = textBeforeSelection.split('\n').length;
    
    // Calculate approximate scroll position
    const selectionTop = (linesBeforeSelection - 1) * lineHeight;
    const textareaHeight = textarea.clientHeight;
    
    // Scroll further down - add extra offset to position match higher in viewport
    // Instead of centering, position it about 1/3 from the top with 20 lines of extra offset
    const extraOffset = lineHeight * 20; // Add 20 lines worth of offset
    textarea.scrollTop = Math.max(0, selectionTop - (textareaHeight / 3) + extraOffset);
  };

  // Update when find text changes - automatically find first occurrence with debounce
  useEffect(() => {
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (findText && textareaRef && jsonData) {
      // Set a new timer to delay the search
      const timer = setTimeout(() => {
        const matches = countMatches(jsonData, findText);
        setTotalMatches(matches);
        
        if (matches > 0) {
          // Find first occurrence automatically
          const firstIndex = jsonData.indexOf(findText);
          if (firstIndex !== -1) {
            textareaRef.setSelectionRange(firstIndex, firstIndex + findText.length);
            scrollToSelection(textareaRef, firstIndex);
            textareaRef.focus();
            setCurrentMatchIndex(1);
            // Update highlighted text
            setHighlightedText(createHighlightedHtml(jsonData, findText, 1));
          }
        } else {
          setCurrentMatchIndex(0);
          setHighlightedText('');
        }
      }, 800); // 800ms debounce delay - gives more time to finish typing
      
      setSearchDebounceTimer(timer);
    } else {
      setTotalMatches(0);
      setCurrentMatchIndex(0);
      setHighlightedText('');
    }

    // Cleanup function
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [findText, jsonData, textareaRef]);

  const findNext = () => {
    if (!findText || !textareaRef) return;
    
    const textarea = textareaRef;
    const text = textarea.value;
    const allMatches = findAllMatches(text, findText);
    
    if (allMatches.length === 0) {
      setMessage('🔍 Text not found: "' + findText + '"');
      setCurrentMatchIndex(0);
      setTotalMatches(0);
      setHighlightedText('');
      return;
    }
    
    // Find next match after current selection
    const currentPos = textarea.selectionEnd;
    let nextMatchIndex = allMatches.findIndex(pos => pos >= currentPos);
    
    // If no match found after current position, wrap to beginning
    if (nextMatchIndex === -1) {
      nextMatchIndex = 0;
    }
    
    const matchPos = allMatches[nextMatchIndex];
    textarea.setSelectionRange(matchPos, matchPos + findText.length);
    scrollToSelection(textarea, matchPos);
    textarea.focus();
    const newMatchIndex = nextMatchIndex + 1;
    setCurrentMatchIndex(newMatchIndex);
    setTotalMatches(allMatches.length);
    setHighlightedText(createHighlightedHtml(text, findText, newMatchIndex));
  };

  const findPrevious = () => {
    if (!findText || !textareaRef) return;
    
    const textarea = textareaRef;
    const text = textarea.value;
    const allMatches = findAllMatches(text, findText);
    
    if (allMatches.length === 0) {
      setMessage('🔍 Text not found: "' + findText + '"');
      setCurrentMatchIndex(0);
      setTotalMatches(0);
      setHighlightedText('');
      return;
    }
    
    // Find previous match before current selection
    const currentPos = textarea.selectionStart;
    let prevMatchIndex = -1;
    
    for (let i = allMatches.length - 1; i >= 0; i--) {
      if (allMatches[i] < currentPos) {
        prevMatchIndex = i;
        break;
      }
    }
    
    // If no match found before current position, wrap to end
    if (prevMatchIndex === -1) {
      prevMatchIndex = allMatches.length - 1;
    }
    
    const matchPos = allMatches[prevMatchIndex];
    textarea.setSelectionRange(matchPos, matchPos + findText.length);
    scrollToSelection(textarea, matchPos);
    textarea.focus();
    const newMatchIndex = prevMatchIndex + 1;
    setCurrentMatchIndex(newMatchIndex);
    setTotalMatches(allMatches.length);
    setHighlightedText(createHighlightedHtml(text, findText, newMatchIndex));
  };

  const replaceOne = () => {
    if (!findText || !textareaRef) return;
    
    const textarea = textareaRef;
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (selectedText === findText) {
      const beforeSelection = textarea.value.substring(0, textarea.selectionStart);
      const afterSelection = textarea.value.substring(textarea.selectionEnd);
      const newValue = beforeSelection + replaceText + afterSelection;
      
      setJsonData(newValue);
      setHasChanges(newValue !== originalData);
      
      // Validate JSON
      try {
        JSON.parse(newValue);
        setIsValidJson(true);
      } catch (error) {
        setIsValidJson(false);
      }
      
      setMessage('✅ Replaced 1 occurrence');
      
      // Move cursor to where replaced text ends
      const newCursorPos = textarea.selectionStart + replaceText.length;
      setTimeout(() => {
        if (textareaRef) {
          textareaRef.setSelectionRange(newCursorPos, newCursorPos);
          findNext();
        }
      }, 50);
    } else {
      findNext();
    }
  };

  const replaceAll = () => {
    if (!findText) return;
    
    const newValue = jsonData.split(findText).join(replaceText);
    const count = (jsonData.split(findText).length - 1);
    
    if (count > 0) {
      setJsonData(newValue);
      setHasChanges(newValue !== originalData);
      
      // Validate JSON
      try {
        JSON.parse(newValue);
        setIsValidJson(true);
      } catch (error) {
        setIsValidJson(false);
      }
      
      setMessage(`✅ Replaced ${count} occurrence${count === 1 ? '' : 's'}`);
      setCurrentMatchIndex(0);
      setTotalMatches(0);
    } else {
      setMessage('🔍 Text not found: "' + findText + '"');
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      } else if (e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(true);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🔄</div>
        <p>Loading database...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#495057',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🗄️ Database JSON Editor
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#6c757d',
          fontSize: '0.95rem'
        }}>
          Edit your entire Firebase database directly as JSON. Be careful - changes affect your live data!
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={saveToFirebase}
          disabled={!isValidJson || !hasChanges || saving}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: !isValidJson || !hasChanges ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !isValidJson || !hasChanges ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: !isValidJson || !hasChanges ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {saving ? '⏳' : '💾'} {saving ? 'Saving...' : 'Save to Firebase'}
        </button>
        
        <button
          onClick={resetChanges}
          disabled={!hasChanges}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: hasChanges ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: hasChanges ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔄 Reset Changes
        </button>
        
        <button
          onClick={fetchDatabaseData}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔄 Refresh from Firebase
        </button>

        <div style={{
          height: '20px',
          width: '1px',
          backgroundColor: '#dee2e6'
        }}></div>

        <button
          onClick={formatJson}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ✨ Auto-Format JSON
        </button>
        
        <button
          onClick={minifyJson}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          📦 Minify
        </button>

        <div style={{
          height: '20px',
          width: '1px',
          backgroundColor: '#dee2e6'
        }}></div>

        <button
          onClick={toggleFindReplace}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: showFindReplace ? '#6f42c1' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔍 Find & Replace
        </button>
      </div>

      {/* Status Indicators */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: isValidJson ? '#d1f2eb' : '#f8d7da',
          color: isValidJson ? '#0c5460' : '#721c24',
          border: `1px solid ${isValidJson ? '#b8e6d3' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {isValidJson ? '✅ Valid JSON' : '❌ Invalid JSON'}
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: hasChanges ? '#fff3cd' : '#d1ecf1',
          color: hasChanges ? '#856404' : '#0c5460',
          border: `1px solid ${hasChanges ? '#ffeaa7' : '#b8daff'}`,
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {hasChanges ? '⚠️ Unsaved Changes' : '✅ No Changes'}
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f8f9fa',
          color: '#495057',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          📊 {jsonData.split('\n').length} lines
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: message.includes('❌') ? '#f8d7da' : 
                           message.includes('⚠️') ? '#fff3cd' : '#d1edff',
          color: message.includes('❌') ? '#721c24' : 
                 message.includes('⚠️') ? '#856404' : '#0c5460',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : 
                                message.includes('⚠️') ? '#ffeaa7' : '#b8daff'}`,
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h4 style={{ margin: 0, color: '#495057', fontSize: '1rem' }}>
                🔍 Find & Replace
              </h4>
              {findText && (
                <span style={{
                  fontSize: '0.85rem',
                  color: totalMatches > 0 ? '#28a745' : '#dc3545',
                  fontWeight: '500',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: totalMatches > 0 ? '#d4edda' : '#f8d7da',
                  borderRadius: '4px'
                }}>
                  {totalMatches > 0 ? `${currentMatchIndex}/${totalMatches}` : '0/0'}
                </span>
              )}
            </div>
            <button
              onClick={toggleFindReplace}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#6c757d'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#495057'
              }}>
                Find:
              </label>
              <textarea
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Enter text to find..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  minHeight: '60px',
                  fontFamily: 'Monaco, Menlo, monospace',
                  resize: 'vertical'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    findNext();
                  }
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#495057'
              }}>
                Replace with:
              </label>
              <textarea
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Enter replacement text..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  minHeight: '60px',
                  fontFamily: 'Monaco, Menlo, monospace',
                  resize: 'vertical'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    replaceOne();
                  }
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={findPrevious}
                  disabled={!findText || totalMatches === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: findText && totalMatches > 0 ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: findText && totalMatches > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: findText && totalMatches > 0 ? 1 : 0.6
                  }}
                >
                  ◀ Previous
                </button>
                
                <button
                  onClick={findNext}
                  disabled={!findText || totalMatches === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: findText && totalMatches > 0 ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: findText && totalMatches > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: findText && totalMatches > 0 ? 1 : 0.6
                  }}
                >
                  Next ▶
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={replaceOne}
                  disabled={!findText || totalMatches === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: findText && totalMatches > 0 ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: findText && totalMatches > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: findText && totalMatches > 0 ? 1 : 0.6
                  }}
                >
                  Replace
                </button>
                
                <button
                  onClick={replaceAll}
                  disabled={!findText || totalMatches === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: findText && totalMatches > 0 ? '#dc3545' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: findText && totalMatches > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: findText && totalMatches > 0 ? 1 : 0.6
                  }}
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor */}
      <div style={{
        border: `2px solid ${isValidJson ? '#28a745' : '#dc3545'}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: isValidJson ? '#f8f9fa' : '#f8d7da',
          padding: '0.75rem 1rem',
          borderBottom: `1px solid ${isValidJson ? '#dee2e6' : '#f5c6cb'}`,
          fontSize: '0.9rem',
          color: '#495057',
          fontWeight: '500'
        }}>
          <span>📝 Firebase Database JSON</span>
        </div>
        
        <div style={{ position: 'relative' }}>
          {/* Background layer for highlights */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '600px',
              padding: '1rem',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'hidden',
              pointerEvents: 'none',
              color: 'transparent',
              zIndex: 1
            }}
            dangerouslySetInnerHTML={{ __html: highlightedText || '' }}
          />
          
          <textarea
            ref={(ref) => setTextareaRef(ref)}
            value={jsonData}
            onChange={handleJsonChange}
            onKeyDown={handleKeyDown}
            style={{
              position: 'relative',
              width: '100%',
              height: '600px',
              padding: '1rem',
              border: 'none',
              resize: 'vertical',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              backgroundColor: isValidJson ? 'transparent' : '#fef5f5',
              color: '#333',
              outline: 'none',
              tabSize: 2,
              zIndex: 2
            }}
            placeholder="Loading database..."
            spellCheck={false}
          />
        </div>
      </div>

      <style>{`
        /* Highlight search matches */
        mark.current-match {
          background-color: #ffd700;
          color: #000;
          font-weight: bold;
          padding: 0;
          border-radius: 2px;
        }
        
        mark.other-match {
          background-color: #ffeb99;
          color: #000;
          padding: 0;
          border-radius: 2px;
        }
        
        /* Highlight manually selected text in textarea */
        textarea::selection {
          background-color: #b3d4fc !important;
          color: #000 !important;
        }
        
        textarea::-moz-selection {
          background-color: #b3d4fc !important;
          color: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default DatabaseEditor;