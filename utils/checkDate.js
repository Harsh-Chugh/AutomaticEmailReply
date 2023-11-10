function check(internalDate, now){
    let size_now = now.length;
    let size_internalDate = internalDate.length;

    console.log(internalDate)

    if(size_internalDate > size_now)  return true;

    // size_internalDate < size_now not possible
    for(i = 0; i < size_now; i++)
    {
        if(now[i] == internalDate[i]) continue;
        return internalDate[i] > now[i];
    }

}