import { useState, useEffect } from 'react';

export function useTable(table: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const handler = () => {
      const arr = Array.from(table.iter());
      setData(arr);
    };

    table.onInsert(handler);
    table.onDelete(handler);
    table.onUpdate(handler);

    handler(); // initial fill

    return () => {
      table.removeOnInsert(handler);
      table.removeOnDelete(handler);
      table.removeOnUpdate(handler);
    };
  }, [table]);

  return data;
}