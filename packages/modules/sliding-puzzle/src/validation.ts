export function isSolvable(tiles: number[], size: number): boolean {
    let inversions = 0;
    const numberedTiles = tiles.filter((tile) => tile !== 0);

    for (let i = 0; i < numberedTiles.length; i++) {
        for (let j = i + 1; j < numberedTiles.length; j++) {
            if (numberedTiles[i] > numberedTiles[j]) {
                inversions++;
            }
        }
    }

    if(size % 2 !== 0) {
        return inversions % 2 === 0;
    }

    const emptyIndex = tiles.indexOf(0);
    const emptyRowFromBottom = size - Math.floor(emptyIndex / size);

    return (inversions + emptyRowFromBottom) % 2 === 1;
}