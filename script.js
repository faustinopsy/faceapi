// Definir um modelo sequencial
const model = tf.sequential();

// Adicionar uma única camada oculta
model.add(tf.layers.dense({units: 1, inputShape: [1], activation: 'linear'}));

// Compilar o modelo
model.compile({
  loss: 'meanSquaredError',
  optimizer: 'sgd'
});

// Dados de treinamento
const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

// Treinar o modelo
model.fit(xs, ys, {epochs: 250}).then(() => {
  // Fazer uma predição após o treinamento
  const output = model.predict(tf.tensor2d([5], [1, 1]));
  
  // Converter o tensor de saída para um valor JS e imprimir no HTML
  output.data().then(prediction => {
    document.getElementById('prediction').textContent = 'Predição para o valor de entrada 5 é: ' + prediction;
  });
});
