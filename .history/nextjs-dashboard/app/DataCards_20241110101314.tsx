"use client";

import React from 'react';
import styles from './DataCards.module.css';

interface Card {
  title: string;
  content: string;
}

interface DataCardsProps {
  cards: Card[];
}

const DataCards: React.FC<DataCardsProps> = ({ cards }) => {
  return (
    <div className={styles.gridContainer}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardContent}>{card.content}</p>
        </div>
      ))}
    </div>
  );
};

export default DataCards;