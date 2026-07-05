import React from 'react';

const TutorialsPage = () => {
  // In a real application, this data would likely come from a backend API.
  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with CritterTrack',
      description: 'Learn the basics of setting up your CritterTrack account and adding your first pet.',
    },
    {
      id: 2,
      title: 'How to Add a New Pet',
      description: 'A step-by-step guide on how to add a new pet to your profile, including their details and photos.',
    },
    {
      id: 3,
      title: 'Tracking Your Pet\'s Activities',
      description: 'Discover how to log and monitor your pet\'s daily activities, such as feeding, walks, and vet visits.',
    },
    {
      id: 4,
      title: 'Understanding Health Records',
      description: 'This tutorial explains how to manage and interpret your pet\'s health records within the app.',
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

  const tutorialsListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    padding: 0,
  };

  const tutorialItemStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out',
  };

  const tutorialTitleStyle = {
    marginTop: 0,
    color: '#3498db',
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>CritterTrack Tutorials</h1>
      <div style={tutorialsListStyle}>
        {tutorials.map(tutorial => (
          <div key={tutorial.id} style={tutorialItemStyle}>
            <h3 style={tutorialTitleStyle}>{tutorial.title}</h3>
            <p>{tutorial.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorialsPage;
