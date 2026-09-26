export class Runner {
    public activePage: Page
    public activePageId: number | undefined

    constructor(
        public doc: Document,
        public runType: RunType,
    ) {
        this.activePage = (app.activeWindow as LayoutWindow).activePage    }
    public run(): void {
        if (!this.activePage) {
            debugToConsole('No Page is Active')
            return
        } else {
            this.activePageId = this.activePage.id
        }
    }
}