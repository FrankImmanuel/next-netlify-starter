import styles from './ImageComponent.module.css';

export default function ImageComponent({image, altText, orientation}) {
return (
    <>
        <div className={`my-3 mt-md-5 ${styles.imageContainer}`}>
            <img
                className={orientation}
                src={image}
                alt={altText}
            />
            <div className={styles.miniatureAbsoluteContainer}>
                <div className={styles.spacer}></div>
                <img
                    className={styles.miniature}
                    src={image}
                    alt={altText}
                />
            </div>
        </div>
    </>
);
}
