export function getByIdOrThrow<T extends HTMLElement>(id: string): T {
    const element: T|null = document.getElementById(id) as T;
    if (element === null)
        throw new Error(`Element with id '${id}' could not be found in document`);
    return element;
}