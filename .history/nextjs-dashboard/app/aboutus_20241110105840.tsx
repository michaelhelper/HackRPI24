// src/components/AboutUs.tsx

import React from 'react';
import styles from './AboutUs.module.css';
import DataCards from './DataCards';

const AboutUs: React.FC = () => {
  // Define your cards data based on the answers to the questions
  const cards = [
    {
      title: 'Our Mission',
      content:
        'At Noise Scape, our mission is to enhance urban living by monitoring and analyzing sound pollution. We aim to provide actionable insights that help reduce noise levels, improving the quality of life in our cities.',
    },
    {
      title: 'What Makes Us Unique',
      content:
        'Noise Scape leverages microphone arrays and Internet of Things connectivity technologies and real-time data collection to create comprehensive noise maps. Our use of spatial interpolation ensures continuous coverage, even in areas with sparse data points.',
    },
    {
      title: 'Importance of Monitoring Decibel Levels',
      content:
        'Excessive noise can lead to hearing loss, stress, and reduced productivity. By meticulously tracking decibel levels, Noise Scape helps identify noise hotspots and supports the implementation of effective noise reduction strategies.',
    },
    {
      title: 'Our Team',
      content:
        'Made By Michael Halpern (CS & ITWS 26), Henry Robbh (CS & ITWS 26), and Rebecca Tsekanovskiy (ITWS 26) for HACK RPI 2024 Urban Upgrades.'
  
    }

  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About Us</h1>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Noise Scape</h2>
        <p className={styles.text}>
          Noise Scape is a pioneering project developed for HackRPI under the Urban Upgrades theme. Our focus is on enhancing the infrastructure, services, and overall quality of life in urban settings. By monitoring decibel levels across various city areas, we provide critical data that aids in combating noise pollution, a growing concern in our bustling cities.
        </p>
      </section>

      {/* Interactive Data Cards */}
      <section className={styles.cardsSection}>
        <DataCards cards={cards} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Why Noise Monitoring Matters</h2>
        <p className={styles.text}>
          Monitoring decibel levels is essential because excessive noise negatively impacts people's health and well-being. Prolonged exposure to high noise levels can cause hearing loss, increase stress, disrupt sleep, and reduce overall life quality. Moreover, noise pollution affects wildlife, disrupting habitats and ecosystems. By accurately mapping and analyzing noise levels, Noise Scape empowers communities and policymakers to implement effective noise mitigation strategies, fostering healthier and more harmonious urban environments.
        </p>
      </section>


    </div>
  );
};

export default AboutUs;
