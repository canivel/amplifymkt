import { format } from "date-fns";

export const convertDollarsToCents = price => {
  return (price * 100).toFixed(0);
};

export const convertCentsToDollar = price => (price / 100).toFixed(2);

export const formatProductDate = date => format(date, "MMM Do, YYYY");
export const formatOrderDate = date => format(date, "ddd h:mm A, MMM Do YYYY");
