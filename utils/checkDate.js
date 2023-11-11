/*
    @Description: Compares two timestamps to check if the internalDate is later than the specified reference time (now).
    @Params:
        internalDate: string - Timestamp when the message was received
        now: string - Timestamp representing the reference time (e.g., when the server started)
    @Return:
        boolean - Returns true if internalDate is later than now, otherwise false.
*/
function check(internalDate, now) {
    let size_now = now.length;
    let size_internalDate = internalDate.length;

    if (size_internalDate > size_now) return true;

    // size_internalDate < size_now not possible
    for (i = 0; i < size_now; i++) {
        if (now[i] == internalDate[i]) continue;
        return internalDate[i] > now[i];
    }
}

module.exports = { check };