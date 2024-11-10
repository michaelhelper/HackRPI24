"use client";

import React, { useState } from 'react';
import styles from './DataCards.module.css';

interface Card {
  title: string;
  content: string;
}

interface DataCardsProps {
  cards: Card[];
}

const DataCards: React.FC<DataCardsProps> = ({ cards }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = cards.length;

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className={styles.container}>
      <div className={styles.slidesWrapper}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${styles.card} ${
              index === currentSlide ? styles.activeSlide : styles.inactiveSlide
            }`}
            style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
          >
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardContent}>{card.content}</p>
          </div>
        ))}
      </div>
      <button className={styles.prevButton} onClick={prevSlide}>
        Previous
      </button>
      <button className={styles.nextButton} onClick={nextSlide}>
        Next
      </button>
      <div className={styles.dots}>
        {cards.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DataCards;