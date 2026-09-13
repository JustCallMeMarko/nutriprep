import map from '/.assets/mapexample.jpg'

function MapPanel() {
    return (
        <>
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            <img src={map} alt="Map placeholder" className="w-full- h-full object-cover"/>
        </div>
        </>
    )
}

export default MapPanel