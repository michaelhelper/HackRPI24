"use client";

import React, { useRef } from 'react';
import Slider from 'react-slick';
import styles from './DataCards.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Card {
  title: string;
  content: string;
}

interface DataCardsProps {
  cards: Card[];
}

const DataCards: React.FC<DataCardsProps> = ({ cards }) => {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    adaptiveHeight: true,
  };

  // Function to go to the next slide
  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  return (
    <div className={styles.container}>
      <Slider ref={sliderRef} {...settings}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardContent}>{card.content}</p>
          </div>
        ))}
      </Slider>
      <button className={styles.shuffleButton} onClick={nextSlide}>
        Next
      </button>
    </div>
  );
};

export default DataCards;
