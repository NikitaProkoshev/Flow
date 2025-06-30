export const dateToString = (date) => {
    return new Date(date).toLocaleDateString('en-ca', {"year": "numeric", "month": "numeric", "day": "numeric"})
}