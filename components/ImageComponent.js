import styles from './ImageComponent.module.css';

export default function ImageComponent({image, altText, orientation}) {

return (
    <>
        <div className={`my-3 mt-md-5 ${(orientation == "landscape") ? styles.imageContainerLandscape : styles.imageContainerPortrait} `}>
            <img
                className={(orientation == "landscape") ? styles.landscape : styles.portrait} 
                src={image}
                alt={altText}
            />
            <div className={styles.miniatureAbsoluteContainer}>
                <div className={(orientation == "landscape") ? styles.landscapeSpacer : styles.portraitSpacer }></div>
                <img
                    className={(orientation == "landscape") ? styles.miniatureLandscape : styles.miniaturePortrait }
                    src={image}
                    alt={altText}
                />
            </div>
        </div>
    </>
);
}
