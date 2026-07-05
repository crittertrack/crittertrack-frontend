import React from 'react';
import { TUTORIAL_LESSONS } from './data/tutorialLessonsNew';
import { getStepScreenshot } from './data/tutorialScreenshots';

const TutorialsPage = () => {
  // The tutorial data is now structured into three main tours, sourced from our new data files.
  const tours = [
    {
      title: 'Getting Started',
      description: 'A comprehensive tour focusing on animal creation and the foundational features of CritterTrack. Perfect for new users.',
      lessons: TUTORIAL_LESSONS.onboarding,
    },
    {
      title: 'Key Features',
      description: 'Explore the core functionalities that make CritterTrack powerful, including litter management, public profiles, and financial tracking.',
      lessons: TUTORIAL_LESSONS.features,
    },
    {
      title: 'Advanced Features',
      description: 'Dive deep into advanced tools like mass management, family tree visualization, genetics calculators, and daily operations workflows.',
      lessons: TUTORIAL_LESSONS.advanced,
    },
  ];

  // For demonstration, inline styles are used.
  // For a production application, consider using CSS Modules, a CSS-in-JS library, or a global stylesheet.
  const pageStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#2c3e50',
  };

  const tourSectionStyle = {
    marginBottom: '3rem',
  };

  const tourHeaderStyle = {
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '1rem',
    marginBottom: '2rem',
    color: '#2c3e50',
  };

  const tourDescriptionStyle = {
    fontSize: '1.1rem',
    color: '#555',
    maxWidth: '800px',
    margin: '0 auto 2rem auto',
    textAlign: 'center',
  };

  const tutorialsListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    padding: 0,
  };

  const tutorialItemStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  };

  const tutorialImageContainerStyle = {
    width: '100%',
    height: '150px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    color: '#ccc',
    fontSize: '0.9rem',
  };

  const tutorialImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const tutorialContentStyle = {
    padding: '1.5rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const tutorialTitleStyle = {
    marginTop: 0,
    color: '#3498db',
  };

  const tutorialDescriptionStyle = {
    flexGrow: 1,
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>CritterTrack Tutorials</h1>
      {tours.map(tour => (
        <section key={tour.title} style={tourSectionStyle}>
          <h2 style={tourHeaderStyle}>{tour.title}</h2>
          <p style={tourDescriptionStyle}>{tour.description}</p>
          <div style={tutorialsListStyle}>
            {tour.lessons.map(lesson => {
              const screenshotUrl = getStepScreenshot(lesson.id, 1);
              return (
                <div key={lesson.id} style={tutorialItemStyle}>
                  <div style={tutorialImageContainerStyle}>
                    {screenshotUrl ? (
                      <img src={screenshotUrl} alt={`${lesson.title} screenshot`} style={tutorialImageStyle} />
                    ) : (
                      <span>No Image Available</span>
                    )}
                  </div>
                  <div style={tutorialContentStyle}>
                    <h3 style={tutorialTitleStyle}>{lesson.title}</h3>
                    <p style={tutorialDescriptionStyle}>{lesson.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default TutorialsPage;