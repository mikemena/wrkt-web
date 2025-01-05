import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProgramContext } from '../../../contexts/programContext';
import { IoChevronBackOutline } from 'react-icons/io5';
import { BsChevronCompactUp, BsChevronCompactDown } from 'react-icons/bs';
import Button from '../../../components/Inputs/Button';
import NavBar from '../../../components/Nav/Nav';
import { useTheme } from '../../../contexts/themeContext';
import { toProperCase } from '../../../utils/stringUtils';
import './program.css';

const ProgramDetailsPage = () => {
  const [expandedWorkouts, setExpandedWorkouts] = useState({});
  const { deleteProgram, state, setActiveWorkout, clearProgram } =
    useContext(ProgramContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const program = state.program;
  const workouts = state.workout.workouts;

  if (!program || !workouts) {
    return <div>Loading...</div>;
  }

  const handleExpandWorkout = workoutId => {
    setActiveWorkout(workoutId);

    setExpandedWorkouts(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

  const exerciseText = count => {
    if (count === 0) return 'No Exercises';
    if (count === 1) return '1 Exercise';
    return `${count} Exercises`;
  };

  const handleDeleteProgram = async programId => {
    await deleteProgram(programId);
    navigate('/programs');
  };

  const handleBackClick = event => {
    clearProgram();
    event.preventDefault();
    navigate('/programs');
  };

  return (
    <div>
      <NavBar />
      <div className='prog-details-page'>
        <div className='prog-details-page__header'>
          <Link
            className={`prog-details-page__title-link ${theme}`}
            onClick={handleBackClick}
          >
            <IoChevronBackOutline className='prog-details-page__back-icon' />
            <span className='prog-details-page__back-text'>Back</span>
          </Link>
          <div className={`prog-details-page__program ${theme}`}>
            <h2 className='prog-details-page__program-title'>{program.name}</h2>
            <div className='prog-details-page__program-details'>
              <div className='prog-details-page__program-details-section'>
                <p className='prog-details-page__program-details-label'>
                  Main Goal
                </p>
                <p className='prog-details-page__program-details-value'>
                  {toProperCase(program.mainGoal)}
                </p>
              </div>
              <div className='prog-details-page__program-details-section'>
                <p className='prog-details-page__program-details-label'>
                  Duration
                </p>
                <p className='prog-details-page__program-details-value'>
                  {program.programDuration} {toProperCase(program.durationUnit)}
                </p>
              </div>
              <div className='prog-details-page__program-details-section'>
                <p className='prog-details-page__program-details-label'>
                  Days Per Week
                </p>
                <p className='prog-details-page__program-details-value'>
                  {program.daysPerWeek}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          {workouts.map(workout => {
            // Sort exercises by the 'order' field before rendering
            const sortedExercises = [...workout.exercises].sort(
              (a, b) => a.order - b.order
            );

            return (
              <div
                key={workout.id}
                className={`prog-details-page__workout-container ${theme}`}
              >
                <div className='prog-details-page__workout-header'>
                  <div className='prog-details-page__workout-expand-container'>
                    <button
                      className='prog-details-page__workout-expand-btn'
                      onClick={() => handleExpandWorkout(workout.id)}
                    >
                      {expandedWorkouts[workout.id] ? (
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
                  </div>
                  <div
                    className={`prog-details-page__workout-summary ${theme}`}
                  >
                    <h1 className={`prog-details-page__workout-name ${theme}`}>
                      {workout.name}
                    </h1>
                    <span
                      className={`prog-details-page__exercise-count ${theme}`}
                    >
                      {exerciseText(sortedExercises.length)}
                    </span>
                  </div>
                </div>
                {expandedWorkouts[workout.id] && (
                  <div className='prog-details-page__exercise-container'>
                    {sortedExercises.map(exercise => (
                      <div
                        key={exercise.id}
                        className='prog-details-page__exercise-wrapper'
                      >
                        <div className='prog-details-page__exercise-header'>
                          <span className='prog-details-page__exercise-order'>
                            {exercise.order}
                          </span>
                          <div className='prog-details-page__exercise-info'>
                            <h3 className='prog-details-page__exercise-name'>
                              {exercise.name}
                            </h3>
                            <div className='prog-details-page__exercise-details'>
                              <span className='prog-details-page__exercise-muscle'>
                                Muscle: {exercise.muscle}
                              </span>
                              <span className='prog-details-page__exercise-equipment'>
                                Equipment: {exercise.equipment}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='prog-details-page__exercise-sets'>
                          <div className='prog-details-page__set-header'>
                            <span>Set</span>
                            <span>Weight</span>
                            <span>Reps</span>
                          </div>
                          {exercise.sets.map(set => (
                            <div
                              key={set.id}
                              className='prog-details-page__set-row'
                            >
                              <span>{set.order}</span>
                              <span>{set.weight}</span>
                              <span>{set.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className='prog-details-page__button-container'>
          <Link
            key={program.id}
            to={`/programs/${program.id}/edit`}
            style={{ textDecoration: 'none' }}
          >
            <Button type='button'>Edit</Button>
          </Link>
          <Button type='submit' onClick={() => handleDeleteProgram(program.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
