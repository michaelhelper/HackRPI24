// app/about-us/page.tsx

import React from 'react';
import Navbar from '../nav'; // Adjust the path if necessary
import AboutUs from '../aboutus'; // Adjust the path if necessary

const AboutUsPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <AboutUs />
      </main>
    </div>
  );
};

export default AboutUsPage;
