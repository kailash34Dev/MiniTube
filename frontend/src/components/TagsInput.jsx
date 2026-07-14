import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagsInput({ tags = [], onChange, placeholder = "Add tags..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="tags-input-container">
      {tags.map((tag, index) => (
        <div className="tag-chip" key={index}>
          {tag}
          <button
            type="button"
            className="tag-remove"
            onClick={() => removeTag(index)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <input
        type="text"
        className="tag-input-field"
        placeholder={tags.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
