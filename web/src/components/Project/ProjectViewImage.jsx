import React, { useEffect, useRef, useState } from 'react';
import "../../styles/Project/ProjectViewImage.css";
import SuspenseBox from '../SuspenseBox';

const IMAGE_MAX_HEIGHT = 700;

const ProjectViewImage = ({ imageUrlList }) => {

    const sliderRef = useRef(null);

    const [isImageLoadList, setIsImageLoadList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);

    /** -- Dynamic Viewer -- */
    const [sliderHeight, setSliderHeight] = useState('auto');
    const observers = useRef([]);

    useEffect(() => {
        const options = {
            root: sliderRef.current,
            threshold: 0.5, /** when the image 50% shown */
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target.querySelector('img');
                    if (image) {
                        /** calculate height and width */
                        const aspectRatio = image.naturalHeight / image.naturalWidth;
                        const containerWidth = sliderRef.current.clientWidth;
                        setSliderHeight(`${((containerWidth * aspectRatio) > IMAGE_MAX_HEIGHT) ? IMAGE_MAX_HEIGHT : containerWidth * aspectRatio}px`);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, options);

        if (sliderRef.current) {
            const imageContainers = sliderRef.current.querySelectorAll(
                '.projectView-image-item-container'
            );
            imageContainers.forEach((container) => {
                observer.observe(container);
                observers.current.push(observer);
            });
        }

        return () => {
            observers.current.forEach((obs) => obs.disconnect());
        };
    }, []);
    /** --- */

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
            if (!isImageLoadList['index']) {
                const imgElement = new Image();
                imgElement.src = image['image'];
                checkImageLoaded(imgElement, index);
            }
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
                style={{ height: sliderHeight }}
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
                                        height: '200px'
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