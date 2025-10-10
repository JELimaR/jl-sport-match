// Define una representación de datos genérica
export interface IDataRepresentation<T> {
  // T es el tipo de datos real (e.g., number[], Float32Array, o un Tensor)
  data: T; 
  // Opcional: Metadatos sobre la estructura del dato (e.g., dimensiones)
  shape?: number[]; 
}

// Define la entrada de datos que el modelo consume (Observación/Features)
export interface IInput<I> extends IDataRepresentation<I> {
  sourceId?: string; // ID de la entidad que genera esta entrada
}

// Define la salida de datos que el modelo produce (Predicción/Acción/Decisión)
export interface IOutput<O> extends IDataRepresentation<O> {
  confidence?: number; // Nivel de confianza o probabilidad de la predicción
}

// Define la información de retroalimentación para el entrenamiento (Recompensa/Error)
export interface IFeedback<TFeedback> {
  reward: number; 
  error?: TFeedback; // El tipo de error puede ser genérico (ej. un valor escalar o un vector)
  isTerminal?: boolean; 
}


/**
 * Interfaz base para cualquier algoritmo o modelo de Machine Learning/IA.
 * TInput: Tipo de los datos de entrada (observación).
 * TOutput: Tipo de los datos de salida (predicción/acción).
 * TFeedback: Tipo de los datos de retroalimentación.
 */
export interface IModel<I, O, F> {
  modelId: string; 
  
  // Realiza una inferencia o predicción basada en la entrada.
  predict(input: IInput<I>): IOutput<O>;
  
  // Proceso para actualizar el estado interno del modelo.
  train(
    input: IInput<I>, 
    output: IOutput<O>, 
    feedback: IFeedback<F>
  ): void;
  
  // Proceso para cargar el modelo en memoria.
  load(pathOrData: string): Promise<void>;
  
  // Proceso para guardar o serializar el estado actual del modelo. Retorna una promesa de tipo genérico.
  save(): Promise<I>; 
}