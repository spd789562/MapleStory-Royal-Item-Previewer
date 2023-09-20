import { useState, DragEvent } from 'react';

interface useDropableProps {
  onDrop: (files: FileList) => void;
}
interface DropableProps {
  onDrop: (files: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
}

const useDropable = (props: useDropableProps): [DropableProps, boolean] => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer?.files;
    if (files) {
      props.onDrop(files);
    }
  };

  const dropableProps: DropableProps = {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
  };

  return [dropableProps, isDragging];
};

export default useDropable;
