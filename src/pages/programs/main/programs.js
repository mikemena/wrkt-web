import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../../../components/Inputs/TextInput';
import { BsChevronCompactUp, BsChevronCompactDown } from 'react-icons/bs';
import { TbHttpDelete } from 'react-icons/tb';
import NavBar from '../../../components/Nav/Nav';
import { ProgramContext } from '../../../contexts/programContext';
import { useTheme } from '../../../contexts/themeContext';
import { DURATION_TYPES, GOAL_TYPES } from '../../../utils/constants';
import { toProperCase } from '../../../utils/stringUtils';
import standardizePrograms from '../../../utils/standardizePrograms.js';

import './programs.css';

const ProgramPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedMainGoal, setSelectedMainGoal] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedDurationUnit, setSelectedDurationUnit] = useState('');
  const [selectedDaysPerWeek, setSelectedDaysPerWeek] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const initialProgramList = {
    programs: {},
    workouts: {}
  };

  const [programList, setProgramList] = useState(initialProgramList);

  const { deleteProgram, initializeEditProgramState } =
    useContext(ProgramContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = event => {
    const newValue = event.target.value;
    setInputValue(newValue);
    setSearchTerm(newValue);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch(
        'http://localhost:9025/api/users/2/programs'
      );
      const data = await response.json();

      // Normalize the fetched data
      const standardizedData = standardizePrograms(data);
      setProgramList({
        programs: standardizedData.programs,
        workouts: standardizedData.workouts
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const filteredPrograms = useMemo(() => {
    return Object.values(programList.programs).filter(program => {
      if (!program || typeof program !== 'object' || !program.id) {
        return false;
      }

      const matchesMainGoal =
        !selectedMainGoal ||
        selectedMainGoal === 'All' ||
        program.mainGoal === selectedMainGoal;
      const matchesDuration =
        !selectedDuration ||
        selectedDuration === 'All' ||
        program.programDuration === parseInt(selectedDuration);
      const matchesDurationUnit =
        !selectedDurationUnit ||
        selectedDurationUnit === 'All' ||
        program.durationUnit.toLowerCase() ===
          selectedDurationUnit.toLowerCase();
      const matchesDaysPerWeek =
        !selectedDaysPerWeek ||
        selectedDaysPerWeek === 'All' ||
        program.daysPerWeek === parseInt(selectedDaysPerWeek);
      const matchesSearchTerm =
        !searchTerm ||
        program.name.toLowerCase().includes(searchTerm.toLowerCase());
      return (
        matchesMainGoal &&
        matchesDuration &&
        matchesDurationUnit &&
        matchesDaysPerWeek &&
        matchesSearchTerm
      );
    });
  }, [
    searchTerm,
    selectedMainGoal,
    selectedDuration,
    selectedDurationUnit,
    selectedDaysPerWeek,
    programList.programs
  ]);

  const onGoalChange = event => {
    setSelectedMainGoal(event.target.value);
  };

  const onDurationChange = event => {
    setSelectedDuration(event.target.value);
  };

  const onDurationUnitChange = event => {
    setSelectedDurationUnit(event.target.value);
  };

  const onDaysPerWeekChange = event => {
    setSelectedDaysPerWeek(event.target.value);
  };

  const handleDeleteProgram = async programId => {
    await deleteProgram(programId);
    // Re-fetch programs after deletion
    fetchPrograms();
    navigate(`/programs/`);
  };

  const handleProgramClick = useCallback(
    program => {
      // Filter workouts for the selected program
      const workouts = Object.values(programList.workouts).filter(
        workout => workout.programId === program.id
      );

      initializeEditProgramState(program, workouts);
      navigate(`/programs/${program.id}`);
    },
    [initializeEditProgramState, navigate, programList.workouts]
  );

  return (
    <div>
      <NavBar />
      <div className='view-prog-page'>
        <div className='view-prog-page__page-title-container'>
          <h1 className='view-prog-page__page-title'>My Programs</h1>
          <Link
            className={`view-prog-page__title-link ${theme}`}
            to='/create-program'
          >
            Create
          </Link>
        </div>
        <div className={`view-prog-page__search-container ${theme}`}>
          <div className='view-prog-page__search-expand-container'>
            <button
              className='view-prog-page__search-expand-btn'
              onClick={handleExpand}
            >
              {isExpanded ? (
                <BsChevronCompactUp
                  className={`workout__icon ${theme}`}
                  size={30}
                />
              ) : (
                <BsChevronCompactDown
                  className={`workout__icon ${theme}`}
                  size={30}
                />
              )}
            </button>
            {!isExpanded && (
              <p className={`view-prog-page__search-filer-text ${theme}`}>
                Filter
              </p>
            )}
          </div>
          {isExpanded && (
            <div className='view-prog-page__search-inputs'>
              <div className={`view-prog-page__search-input-top-row ${theme}`}>
                <TextInput
                  list='programs'
                  className={`program-search__search-text-input ${theme}`}
                  id='program-search-bar'
                  onChange={handleInputChange}
                  value={inputValue}
                  type='search'
                  placeholder='Program Names'
                />
                <datalist id='programs'>
                  {Object.values(programList.programs).map(program => (
                    <option key={program.id} value={program.name} />
                  ))}
                </datalist>
                <select
                  onChange={onGoalChange}
                  className={`program-search__goals ${theme}`}
                >
                  <option value=''>Goal</option>
                  {GOAL_TYPES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`view-prog-page__search-input-bottom-row ${theme}`}
              >
                <TextInput
                  className={`program-search__duration ${theme}`}
                  type='search'
                  onChange={onDurationChange}
                  onBlur={onDurationChange}
                  placeholder='Duration'
                />
                <select
                  onChange={onDurationUnitChange}
                  className={`program-search__duration-unit ${theme}`}
                >
                  <option value=''>Duration Type</option>
                  {DURATION_TYPES.map(option => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <TextInput
                  className={`program-search__days-per-week ${theme}`}
                  type='search'
                  onChange={onDaysPerWeekChange}
                  onBlur={onDaysPerWeekChange}
                  placeholder='Days Per Week'
                />
              </div>

              <div
                className={`view-prog-page__search-input-container ${theme}`}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className='view-prog-page__program-list'>
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map(program => (
            <Link
              key={program.id}
              to={`/programs/${program.id}`}
              onClick={() => handleProgramClick(program)}
            >
              <div className={`view-prog-page__program ${theme}`}>
                <h2 className='view-prog-page__program-title'>
                  {program.name}
                </h2>
                <div className='view-prog-page__program-details'>
                  <div className='view-prog-page__program-details-section'>
                    <p className='view-prog-page__program-details-label'>
                      Main Goal
                    </p>
                    <p className='view-prog-page__program-details-value'>
                      {toProperCase(program.mainGoal)}
                    </p>
                  </div>
                  <div className='view-prog-page__program-details-section'>
                    <p className='view-prog-page__program-details-label'>
                      Duration
                    </p>
                    <p className='view-prog-page__program-details-value'>
                      {program.programDuration}{' '}
                      {toProperCase(program.durationUnit)}
                    </p>
                  </div>
                  <div className='view-prog-page__program-details-section'>
                    <p className='view-prog-page__program-details-label'>
                      Days Per Week
                    </p>
                    <p className='view-prog-page__program-details-value'>
                      {program.daysPerWeek}
                    </p>
                  </div>
                </div>
                <button
                  className={`view-prog-page__remove-program-btn ${theme}`}
                  onClick={() => handleDeleteProgram(program.id)}
                >
                  <TbHttpDelete size={30} />
                </button>
              </div>
            </Link>
          ))
        ) : (
          <p className={`view-prog-page__no-programs ${theme}`}>
            No Programs Exist.{' '}
            <Link
              className={`view-prog-page__link ${theme}`}
              to='/create-program'
            >
              Create One!
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgramPage;
