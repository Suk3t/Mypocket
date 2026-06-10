declare namespace chrome {
  namespace tabs {
    interface Tab {
      title?: string
      url?: string
    }

    function query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Tab[]>
    function create(createProperties: { url: string }): Promise<Tab>
  }

  namespace runtime {
    function getURL(path: string): string
  }
}
