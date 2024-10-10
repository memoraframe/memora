import { SwapRightOutlined , RotateRightOutlined, ZoomInOutlined, VerticalAlignTopOutlined} from '@ant-design/icons';
import { Transformation } from '@types/MemoraConfig';
import React from 'react';

// Create a valid array of transformations to avoid using Object.values()
const transformationsArray: Transformation[] = [
  Transformation.ROTATE,
  Transformation.SLIDEX,
  Transformation.SCALE,
  Transformation.SLIDEY, 
  Transformation.SKEW,
  Transformation.FLIP,
  Transformation.PERSPECTIVE
];

// Move transformations outside the function to prevent re-creation
const transformations = [
  (index: number) => `translateX(-${index * 100}%)`,
  (index: number) => `translateY(-${index * 100}%)`, // needs flex-direction: column
  (index: number) => `scale(${index})`,
  (index: number) => `rotate(${index * 360}deg) translateX(-${index * 100}%)`,
  (index: number) => `skew(${index === 1 ? 0 : index === 0 ? -20 : index * 20}deg, ${index === 1 ? 0 : index === 0 ? -20 : index * 20}deg)`, // Skew reverses for index 0
  (index: number) => `scaleY(${index === 1 ? 1 : index === 0 ? -1 : -1})`,
  (index: number) => `perspective(500px) rotateX(${index === 0 ? -90 : index === 2 ? 90 : 0}deg)`, // Negative 90 for index 0, 90 for index 2
];

const getTransformationByType = (index: number, type: Transformation): string => {
  const definedTransformations = {
    [Transformation.SLIDEX]: transformations[0],
    [Transformation.SLIDEY]: transformations[1],
    [Transformation.SCALE]: transformations[2],
    [Transformation.ROTATE]: transformations[3],
    [Transformation.SKEW]: transformations[4],
    [Transformation.FLIP]: transformations[5],
    [Transformation.PERSPECTIVE]: transformations[6],
  };

  return definedTransformations[type](index);
};

const useTransformation = (transformation: Transformation) => {
  const getTransformation = (index: number) => {
    return getTransformationByType(index, transformation);
  };
  const getTransformations = () => {
    return transformationsArray
  }

  const getTransformationIcon = (transformation: Transformation): React.ReactNode => {
    switch (transformation) {
      case Transformation.ROTATE:
        return <RotateRightOutlined  />;
      case Transformation.SLIDEX:
        return <SwapRightOutlined  />;
      case Transformation.SCALE:
        return <ZoomInOutlined  />;
      case Transformation.SLIDEY:
        return <VerticalAlignTopOutlined />;
        case Transformation.SKEW:
          return <VerticalAlignTopOutlined style={{ transform: 'rotate(45deg)' }} />;
        case Transformation.FLIP:
          return <VerticalAlignTopOutlined style={{ transform: 'scaleX(-1)' }} />;
        case Transformation.PERSPECTIVE:
          return <RotateRightOutlined style={{  transform: 'perspective(500px) rotateX(45deg)' }} />;
      default:
        return <SwapRightOutlined />;
    }
  };

  return {
    getTransformations,
    getTransformationIcon,
    getTransformation,
  };
};

export default useTransformation;
