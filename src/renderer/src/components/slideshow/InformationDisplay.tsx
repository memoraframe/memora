import React from "react";
import imageInformation from "../imageInformation";

import { Typography } from 'antd';

const { Title } = Typography;


export const InformationDisplay: React.FC<{ imageSrc: string, show: boolean }> = ({imageSrc, show}) => {
    const image = imageInformation(imageSrc)
    
    return (
        <div className={`slideshow-settings ${show ? '' : 'hidden'}`}>
            <div className="information-bar">
                <div className="information-bar-inner">
                    <Title>{image.name.replace("_", " ")}</Title>
                </div>
            </div>
        </div>
    );
};
