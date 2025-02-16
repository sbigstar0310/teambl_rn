import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewImage.css";
import SuspenseBox from '../SuspenseBox';

const ProjectViewImage = ({ imageUrlList }) => {

    const sliderRef = useRef(null);

    const [isImageLoadList, setIsImageLoadList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);

    const handleScroll = () => {
        const slider = sliderRef.current;
        const scrollLeft = slider.scrollLeft;
        const width = slider.offsetWidth;
        const newIndex = Math.round(scrollLeft / width) + 1;
        setCurrentIndex(newIndex);
    };

    const checkImageLoaded = (imgElement, index) => {
        if (imgElement.complete) {
            handleImageLoad(index);
        }
    };

    const handleImageLoad = (index) => {
        setIsImageLoadList((prevState) => ({
            ...prevState,
            [index]: true,
        }));
    };

    useEffect(() => {
        const slider = sliderRef.current;

        slider.addEventListener('scroll', handleScroll);

        return () => {
          slider.removeEventListener('scroll', handleScroll);
        };
    }, [imageUrlList]);

    useEffect(() => {
        setIsImageLoadList(Array(imageUrlList.length).fill(false));

        imageUrlList.forEach((image, index) => {
            const imgElement = new Image();
            imgElement.src = image['image'];
            checkImageLoaded(imgElement, index);
        });
    }, [imageUrlList]);

    return (
        <div className='projectView-image-container'>
            {
                (imageUrlList.length > 1) &&
                <div className='projectView-image-index-badge'>
                    {currentIndex} / {imageUrlList.length}
                </div>
            }
            {/* image slider */}
            <div
                ref={sliderRef}
                className='projectView-image-slider'
            >
                {imageUrlList.map((image, index) => {
                    return (
                        <div
                            key={index}
                            className='projectView-image-item-container'
                        >
                            <img
                                className={`projectView-image-item`
                                    + `${isImageLoadList[index] ? '' : ' projectView-image-hidden'}`}
                                src={image['image']}
                                onLoad={() => {
                                    handleImageLoad(index);
                                }}
                            />
                            {
                                (!isImageLoadList[index]) &&
                                <SuspenseBox
                                    key={index}
                                    styleOv={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectViewImage;