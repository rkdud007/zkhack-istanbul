import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

export default function _404() {
    return (
        <div className="error-wrapper layout-wrapper">
            <AlternateHeader displayMessage="Page Not Found" />
            <HeadMetadata title="Unkown | ZKHackerNews" />
            <span>An error occurred. (ERROR: 400)</span>
        </div>
    );
}
