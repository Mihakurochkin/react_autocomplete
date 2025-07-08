import React, { useState, useRef } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import debounce from 'lodash.debounce';
import classNames from 'classnames';
import { Person } from './types/Person';

export const App: React.FC = () => {
  const [sortedArray, setSortedArray] = useState(peopleFromServer);
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [title, setTitle] = useState('No selected person');
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  function onSelected(person: Person) {
    setTitle(`${person.name} (${person.born} - ${person.died})`);
    setInputValue(person.name);
    inputRef.current?.blur();
    setIsInputActive(false);
    setSortedArray(peopleFromServer);
  }

  function hangleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle('No selected person');

    setInputValue(event.target.value);
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setSortedArray(peopleFromServer.filter((person) => {
        const { name } = person;
        return name.toLowerCase().includes(event.target.value.toLowerCase());
      }));
    }, 300)(event);
  }


  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {title}
        </h1>

        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              value={inputValue}
              onFocus={() => {
                if (blurTimeout.current) {
                  clearTimeout(blurTimeout.current);
                  blurTimeout.current = null;
                }
                setIsInputActive(true);
              }}
              ref={inputRef}
              onBlur={() => {
                blurTimeout.current = setTimeout(() => {
                  setIsInputActive(false);
                }, 100);
              }}
              onChange={hangleInputChange}
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            {sortedArray.length !== 0 && isInputActive && (
              <div className="dropdown-content" style={{ background: 'white' }}>
                {sortedArray.map((person) => (
                  <div
                    key={person.name}
                    className={classNames(
                      'dropdown-item',
                      'has-text-weight-bold',
                      'has-text-link',
                      'is-clickable',
                    )}
                    style={{ background: 'white', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    onMouseDown={e => {
                      e.preventDefault();
                    }}
                    onClick={() => {
                      onSelected(person);
                      setIsInputActive(false);
                    }}
                    data-cy="suggestion"
                  >
                    {person.name}
                  </div>
                ))}
              </div>
            )}
            {sortedArray.length === 0 && (
              <div
                className="
                  notification
                  is-danger
                  is-light
                  mt-3
                  is-align-self-flex-start
                "
                role="alert"
                data-cy="no-suggestions-message"
              >
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
