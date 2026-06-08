// Фабрични стойности за резервоарите (диаметър и височина, в метри).
// Прилагат се само при ПЪРВО създаване на резервоара (ON CONFLICT DO NOTHING),
// за да не презаписват промени, направени по-късно от страница "Настройки".
// Останалите параметри (плътност, корекции и т.н.) се задават от потребителя.
module.exports = [
  { id: 1, diameter: 10.43, height: 12 },
  { id: 2, diameter: 10.43, height: 12 },
  { id: 3, diameter: 7.59, height: 7.5 },
  { id: 4, diameter: 7.59, height: 7.5 },
  { id: 5, diameter: 4.73, height: 6 },
  { id: 6, diameter: 4.73, height: 6 },
  { id: 7, diameter: 8.53, height: 7.5 },
  { id: 8, diameter: 6.64, height: 6 },
  { id: 9, diameter: 4.73, height: 6 },
  { id: 10, diameter: 4.73, height: 6 },
  { id: 11, diameter: 6.64, height: 6 },
  { id: 12, diameter: 6.64, height: 6 },
  { id: 13, diameter: 8.53, height: 7.5 },
  { id: 14, diameter: 8.53, height: 7.5 },
  { id: 15, diameter: 7.59, height: 7.5 },
  { id: 16, diameter: 7.59, height: 7.5 },
];
