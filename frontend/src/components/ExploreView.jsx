import { usePhotoContext } from '../context/PhotoContext';
import PersonCard from './PersonCard';

function ExploreView() {
    const { 
        labels, 
        selectedLabel,
        loading,
        error,
        fetchLabels 
    } = usePhotoContext();

    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="explore-view">
            <div className="people-list">
                {labels.map(label => (
                    <PersonCard
                        key={label}
                        person={label}
                        isSelected={selectedLabel === label}
                    />
                ))}
            </div>
            <div className="selected-photos">
                {/* Photo grid for selected person */}
            </div>
        </div>
    );
}

export default ExploreView;